export type AssetType = "fungible" | "nft";

export type KycStatus = "unknown" | "pending" | "approved" | "rejected";

export type ComplianceStatus = {
  whitelisted: boolean;
  blacklisted: boolean;
  kycStatus: KycStatus;
  lastUpdated?: string;
};

export type Asset = {
  id: string;
  type: AssetType;
  name: string;
  symbol?: string;
  decimals?: number;
  supply?: string;
  tokenAddress: string;
  imageUrl?: string;
  description?: string;
  oracleId?: string;
};

export type PortfolioHolding = {
  assetId: string;
  balance: string;
  valuation?: string;
};

export type Trade = {
  id: string;
  assetIn: string;
  assetOut: string;
  amountIn: string;
  amountOut: string;
  priceImpact?: string;
  timestamp: string;
  txHash?: string;
};

export type OraclePrice = {
  assetId: string;
  price: string;
  updatedAt: string;
  source: string;
  volume?: string;
};

export type IndexerStatus = {
  lastSynced: string;
  lagSeconds: number;
  chainId: number;
};

export type KycRequest = {
  id: string;
  address: string;
  name: string;
  submittedAt: string;
  status: KycStatus;
};

export type DexQuote = {
  amountOut: string;
  minAmountOut: string;
  priceImpact: string;
  route: string;
  fee: string;
};

export type WalletState = {
  address?: string;
  chainId?: number;
  connected: boolean;
  status: "idle" | "connecting" | "ready" | "error";
  error?: string;
};
