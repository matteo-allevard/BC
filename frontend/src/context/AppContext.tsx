import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type {
  Asset,
  ComplianceStatus,
  IndexerStatus,
  OraclePrice,
  PortfolioHolding,
  Trade,
  WalletState
} from "../types";
import { appConfig } from "../config/appConfig";
import {
  getAssets,
  getCompliance,
  getIndexerStatus,
  getOraclePrice,
  getPortfolio,
  getTrades
} from "../services/indexer";
import {
  connectWallet,
  getBrowserProvider,
  getCurrentAccount,
  onWalletEvents
} from "../services/wallet";
import { useInterval } from "../hooks/useInterval";
import type { BrowserProvider, JsonRpcSigner } from "ethers";

export type AppContextValue = {
  wallet: WalletState;
  provider?: BrowserProvider;
  signer?: JsonRpcSigner;
  assets: Asset[];
  portfolio: PortfolioHolding[];
  compliance?: ComplianceStatus;
  trades: Trade[];
  oraclePrices: Record<string, OraclePrice>;
  indexerStatus?: IndexerStatus;
  refreshAll: () => Promise<void>;
  connect: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    status: "idle"
  });
  const [provider, setProvider] = useState<BrowserProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus>();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [oraclePrices, setOraclePrices] = useState<Record<string, OraclePrice>>({});
  const [indexerStatus, setIndexerStatus] = useState<IndexerStatus>();

  const loadPublicData = useCallback(async () => {
    const [assetsResult, tradesResult, indexer] = await Promise.all([
      getAssets(),
      getTrades(),
      getIndexerStatus()
    ]);
    setAssets(assetsResult);
    setTrades(tradesResult);
    setIndexerStatus(indexer);

    const oracleEntries = await Promise.all(
      assetsResult
        .filter((asset) => asset.oracleId)
        .map(async (asset) => {
          const oracle = await getOraclePrice(asset.id);
          return [asset.id, oracle] as const;
        })
    );
    setOraclePrices(Object.fromEntries(oracleEntries));
  }, []);

  const loadPrivateData = useCallback(
    async (address: string) => {
      const [portfolioResult, complianceResult] = await Promise.all([
        getPortfolio(address),
        getCompliance(address)
      ]);
      setPortfolio(portfolioResult);
      setCompliance(complianceResult);
    },
    []
  );

  const refreshAll = useCallback(async () => {
    await loadPublicData();
    if (wallet.address) {
      await loadPrivateData(wallet.address);
    }
  }, [loadPrivateData, loadPublicData, wallet.address]);

  const connect = useCallback(async () => {
    setWallet((prev) => ({ ...prev, status: "connecting" }));
    try {
      const { provider: nextProvider, signer: nextSigner, address, chainId } =
        await connectWallet();
      setProvider(nextProvider);
      setSigner(nextSigner);
      setWallet({
        connected: true,
        status: "ready",
        address,
        chainId
      });
      await loadPublicData();
      await loadPrivateData(address);
    } catch (error) {
      setWallet({
        connected: false,
        status: "error",
        error: (error as Error).message
      });
    }
  }, [loadPrivateData, loadPublicData]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { accounts, chainId } = await getCurrentAccount();
        if (accounts.length > 0) {
          const nextProvider = getBrowserProvider();
          const nextSigner = await nextProvider.getSigner();
          setProvider(nextProvider);
          setSigner(nextSigner);
          setWallet({
            connected: true,
            status: "ready",
            address: accounts[0],
            chainId
          });
        }
      } catch {
        // Silent if wallet not installed.
      } finally {
        await loadPublicData();
      }
    };

    bootstrap();
  }, [loadPublicData]);

  useEffect(() => {
    const unsubscribe = onWalletEvents(
      async (accounts) => {
        if (accounts.length === 0) {
          setWallet({ connected: false, status: "idle" });
          setPortfolio([]);
          setCompliance(undefined);
          return;
        }
        const nextProvider = getBrowserProvider();
        const nextSigner = await nextProvider.getSigner();
        setProvider(nextProvider);
        setSigner(nextSigner);
        setWallet((prev) => ({
          ...prev,
          connected: true,
          address: accounts[0],
          status: "ready"
        }));
      },
      (chainId) => {
        setWallet((prev) => ({
          ...prev,
          chainId
        }));
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (wallet.address) {
      loadPrivateData(wallet.address);
    }
  }, [wallet.address, loadPrivateData]);

  useInterval(
    () => {
      refreshAll();
    },
    appConfig.indexer.pollIntervalMs
  );

  const value = useMemo(
    () => ({
      wallet,
      provider,
      signer,
      assets,
      portfolio,
      compliance,
      trades,
      oraclePrices,
      indexerStatus,
      refreshAll,
      connect
    }),
    [
      wallet,
      provider,
      signer,
      assets,
      portfolio,
      compliance,
      trades,
      oraclePrices,
      indexerStatus,
      refreshAll,
      connect
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
