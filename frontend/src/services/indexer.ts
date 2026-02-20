import { appConfig } from "../config/appConfig";
import type {
  Asset,
  ComplianceStatus,
  IndexerStatus,
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

export const getIndexerStatus = async (): Promise<IndexerStatus> => {
  try {
    const data = await fetchJson<{ status: string; last_sync: string }>("/status");
    return {
      lastSynced: data.last_sync || new Date().toISOString(),
      lagSeconds: 0,
      chainId: 0
    };
  } catch {
    return {
      lastSynced: new Date().toISOString(),
      lagSeconds: 0,
      chainId: 0
    };
  }
};

export const getAssets = async (): Promise<Asset[]> => {
  try {
    const nftIssuer = appConfig.xrpl.nftIssuer;
    const path = nftIssuer ? `/assets?issuer=${nftIssuer}` : "/assets";
    return await fetchJson(path);
  } catch {
    return [];
  }
};

export const getPortfolio = async (address: string): Promise<PortfolioHolding[]> => {
  try {
    const data = await fetchJson<{ holdings: Array<{ asset_id: string; balance: string; name: string; type: string }> }>(`/portfolio/${address}`);
    return (data.holdings || []).map(h => ({
      assetId: h.asset_id,
      balance: h.balance,
      valuation: h.type === "native" ? `${h.balance} XRP` : undefined
    }));
  } catch {
    return [];
  }
};

export const getCompliance = async (address: string): Promise<ComplianceStatus> => {
  const kycIssuer = appConfig.xrpl.kycIssuer;
  if (!kycIssuer) {
    return { whitelisted: false, blacklisted: false, kycStatus: "unknown" };
  }
  try {
    const data = await fetchJson<{ kyc: boolean; whitelisted: boolean; blacklisted: boolean }>(
      `/compliance/${address}?kyc_issuer=${kycIssuer}`
    );
    return {
      whitelisted: data.whitelisted,
      blacklisted: data.blacklisted,
      kycStatus: data.kyc ? "approved" : "unknown",
      lastUpdated: new Date().toISOString()
    };
  } catch {
    return { whitelisted: false, blacklisted: false, kycStatus: "unknown" };
  }
};

export const getTrades = async (address?: string): Promise<Trade[]> => {
  try {
    const path = address ? `/trades?address=${address}` : "/trades";
    const data = await fetchJson<Array<{ hash: string; type: string; from: string; timestamp: string }>>(path);
    return data.map((tx, i) => ({
      id: tx.hash || `trade-${i}`,
      assetIn: tx.type,
      assetOut: "XRP",
      amountIn: "1",
      amountOut: "1",
      timestamp: tx.timestamp || new Date().toISOString(),
      txHash: tx.hash
    }));
  } catch {
    return [];
  }
};

export const getOraclePrice = async (assetId: string): Promise<OraclePrice> => {
  try {
    const data = await fetchJson<{ price: number; currency: string }>(`/oracle/${assetId}`);
    return {
      assetId,
      price: `$${data.price}`,
      updatedAt: new Date().toISOString(),
      source: "XRPL Oracle"
    };
  } catch {
    return {
      assetId,
      price: "$0",
      updatedAt: new Date().toISOString(),
      source: "N/A"
    };
  }
};

export const getNfts = async (address: string) => {
  try {
    return await fetchJson(`/nfts/${address}`);
  } catch {
    return [];
  }
};

export const getAccountInfo = async (address: string) => {
  try {
    return await fetchJson(`/account/${address}`);
  } catch {
    return null;
  }
};
