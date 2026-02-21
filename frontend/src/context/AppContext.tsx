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
  getSavedWalletAddress,
  saveWalletAddress,
  clearWalletAddress,
  isValidXrplAddress
} from "../services/wallet";
import { useInterval } from "../hooks/useInterval";

export type AppContextValue = {
  wallet: WalletState;
  assets: Asset[];
  portfolio: PortfolioHolding[];
  compliance?: ComplianceStatus;
  trades: Trade[];
  oraclePrices: Record<string, OraclePrice>;
  indexerStatus?: IndexerStatus;
  refreshAll: () => Promise<void>;
  connect: (address: string) => Promise<void>;
  disconnect: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    status: "idle"
  });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus>();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [oraclePrices, setOraclePrices] = useState<Record<string, OraclePrice>>({});
  const [indexerStatus, setIndexerStatus] = useState<IndexerStatus>();

  const loadPublicData = useCallback(async () => {
    try {
      const [assetsResult, indexer] = await Promise.all([
        getAssets(),
        getIndexerStatus()
      ]);
      setAssets(assetsResult);
      setIndexerStatus(indexer);

      // Toujours charger XRP + le skin AK47 depuis l'oracle
      const ORACLE_IDS = ["XRP", "AK47-REDLINE"];
      const oracleEntries = await Promise.all(
        ORACLE_IDS.map(async (id) => {
          const oracle = await getOraclePrice(id);
          return [id, oracle] as const;
        })
      );
      setOraclePrices(Object.fromEntries(oracleEntries));
    } catch (e) {
      console.error("Failed to load public data:", e);
    }
  }, []);

  const loadPrivateData = useCallback(async (address: string) => {
    try {
      const [portfolioResult, complianceResult, tradesResult] = await Promise.all([
        getPortfolio(address),
        getCompliance(address),
        getTrades(address)
      ]);
      setPortfolio(portfolioResult);
      setCompliance(complianceResult);
      setTrades(tradesResult);
    } catch (e) {
      console.error("Failed to load private data:", e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await loadPublicData();
    if (wallet.address) {
      await loadPrivateData(wallet.address);
    }
  }, [loadPrivateData, loadPublicData, wallet.address]);

  const connect = useCallback(async (address: string) => {
    if (!isValidXrplAddress(address)) {
      setWallet({
        connected: false,
        status: "error",
        error: "Invalid XRPL address"
      });
      return;
    }

    setWallet({
      connected: true,
      status: "ready",
      address
    });
    saveWalletAddress(address);
    await loadPublicData();
    await loadPrivateData(address);
  }, [loadPrivateData, loadPublicData]);

  const disconnect = useCallback(() => {
    clearWalletAddress();
    setWallet({ connected: false, status: "idle" });
    setPortfolio([]);
    setCompliance(undefined);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const savedAddress = getSavedWalletAddress();
      if (savedAddress && isValidXrplAddress(savedAddress)) {
        setWallet({
          connected: true,
          status: "ready",
          address: savedAddress
        });
        await loadPrivateData(savedAddress);
      }
      await loadPublicData();
    };
    bootstrap();
  }, [loadPublicData, loadPrivateData]);

  useInterval(() => {
    refreshAll();
  }, appConfig.indexer.pollIntervalMs);

  const value = useMemo(
    () => ({
      wallet,
      assets,
      portfolio,
      compliance,
      trades,
      oraclePrices,
      indexerStatus,
      refreshAll,
      connect,
      disconnect
    }),
    [
      wallet,
      assets,
      portfolio,
      compliance,
      trades,
      oraclePrices,
      indexerStatus,
      refreshAll,
      connect,
      disconnect
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
