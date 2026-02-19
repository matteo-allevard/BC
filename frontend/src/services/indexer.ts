import { appConfig } from "../config/appConfig";
import type {
  Asset,
  ComplianceStatus,
  DexQuote,
  IndexerStatus,
  KycRequest,
  OraclePrice,
  PortfolioHolding,
  Trade
} from "../types";

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${appConfig.indexer.baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`Indexer error ${response.status}`);
  }
  return (await response.json()) as T;
};

const mockDelay = async () => new Promise((resolve) => setTimeout(resolve, 300));

export const getIndexerStatus = async (): Promise<IndexerStatus> => {
  if (appConfig.features.enableMocks) {
    await mockDelay();
    return {
      lastSynced: new Date().toISOString(),
      lagSeconds: 18,
      chainId: appConfig.chain.chainId
    };
  }
  return fetchJson("/status");
};

export const getAssets = async (): Promise<Asset[]> => {
  if (appConfig.features.enableMocks) {
    await mockDelay();
    return [
      {
        id: "asset-1",
        type: "fungible",
        name: "Paris Commercial Realty",
        symbol: "PCR",
        decimals: 6,
        supply: "10,000,000",
        tokenAddress: "0x0000000000000000000000000000000000000001",
        description: "Tokenized shares of a Paris commercial property portfolio.",
        oracleId: "oracle-pcr"
      },
      {
        id: "asset-2",
        type: "nft",
        name: "Ardennes Diamond",
        tokenAddress: "0x0000000000000000000000000000000000000002",
        description: "Single unique diamond with certified provenance.",
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=640&q=80",
        oracleId: "oracle-diamond"
      }
    ];
  }
  return fetchJson("/assets");
};

export const getPortfolio = async (address: string): Promise<PortfolioHolding[]> => {
  if (appConfig.features.enableMocks) {
    await mockDelay();
    return [
      { assetId: "asset-1", balance: "125,000", valuation: "$123,000" },
      { assetId: "asset-2", balance: "1", valuation: "$58,400" }
    ];
  }
  return fetchJson(`/portfolio/${address}`);
};

export const getCompliance = async (address: string): Promise<ComplianceStatus> => {
  if (appConfig.features.enableMocks) {
    await mockDelay();
    return {
      whitelisted: true,
      blacklisted: false,
      kycStatus: "approved",
      lastUpdated: new Date().toISOString()
    };
  }
  return fetchJson(`/compliance/${address}`);
};

export const getTrades = async (): Promise<Trade[]> => {
  if (appConfig.features.enableMocks) {
    await mockDelay();
    return [
      {
        id: "trade-1",
        assetIn: "PCR",
        assetOut: appConfig.chain.nativeSymbol,
        amountIn: "8,500",
        amountOut: "4.12",
        priceImpact: "0.9%",
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        txHash: "0xabc"
      }
    ];
  }
  return fetchJson("/trades");
};

export const getOraclePrice = async (assetId: string): Promise<OraclePrice> => {
  if (appConfig.features.enableMocks) {
    await mockDelay();
    return {
      assetId,
      price: "$1,234.50",
      updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      source: "Classroom Oracle"
    };
  }
  return fetchJson(`/oracle/${assetId}`);
};

export const getDexQuote = async (
  assetIn: string,
  assetOut: string,
  amountIn: string
): Promise<DexQuote> => {
  if (appConfig.features.enableMocks) {
    await mockDelay();
    return {
      amountOut: "4.08",
      minAmountOut: "4.04",
      priceImpact: "1.1%",
      route: `${assetIn} -> ${assetOut}`,
      fee: "0.3%"
    };
  }
  return fetchJson(`/dex/quote?assetIn=${assetIn}&assetOut=${assetOut}&amountIn=${amountIn}`);
};

export const getKycRequests = async (): Promise<KycRequest[]> => {
  if (appConfig.features.enableMocks) {
    await mockDelay();
    return [
      {
        id: "kyc-1",
        address: "0x0000000000000000000000000000000000000042",
        name: "Sample Investor",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: "pending"
      }
    ];
  }
  return fetchJson("/kyc/requests");
};

export const updateKycStatus = async (id: string, status: string) => {
  const response = await fetch(`${appConfig.indexer.baseUrl}/kyc/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    throw new Error("KYC update failed");
  }
  return response.json();
};

export const submitSwap = async (payload: Record<string, unknown>) => {
  const response = await fetch(`${appConfig.indexer.baseUrl}/dex/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Swap submission failed");
  }
  return response.json();
};
