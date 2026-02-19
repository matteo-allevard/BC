const enableMocks = import.meta.env.VITE_USE_MOCKS === "true";
const env = import.meta.env;

export const appConfig = {
  appName: "Tokenized Asset Management",
  chain: {
    name: env.VITE_CHAIN_NAME ?? "Your Testnet",
    chainId: Number(env.VITE_CHAIN_ID ?? 11155111),
    rpcUrl: env.VITE_RPC_URL ?? "https://YOUR_RPC_URL",
    explorerUrl: env.VITE_EXPLORER_URL ?? "https://YOUR_EXPLORER",
    nativeSymbol: env.VITE_NATIVE_SYMBOL ?? "ETH"
  },
  indexer: {
    baseUrl: env.VITE_INDEXER_BASE_URL ?? "https://YOUR_INDEXER_API",
    pollIntervalMs: 60_000
  },
  compliance: {
    kycUrl: env.VITE_KYC_URL ?? "https://YOUR_KYC_PORTAL",
    termsUrl: env.VITE_TERMS_URL ?? "https://YOUR_TERMS"
  },
  contracts: {
    whitelist:
      env.VITE_WHITELIST_CONTRACT ?? "0x0000000000000000000000000000000000000000",
    tokenFactory:
      env.VITE_TOKEN_FACTORY_CONTRACT ?? "0x0000000000000000000000000000000000000000",
    nftFactory:
      env.VITE_NFT_FACTORY_CONTRACT ?? "0x0000000000000000000000000000000000000000",
    oracle: env.VITE_ORACLE_CONTRACT ?? "0x0000000000000000000000000000000000000000",
    dexRouter:
      env.VITE_DEX_ROUTER_CONTRACT ?? "0x0000000000000000000000000000000000000000",
    dexPool: env.VITE_DEX_POOL_CONTRACT ?? "0x0000000000000000000000000000000000000000"
  },
  dex: {
    type: env.VITE_DEX_TYPE ?? "uniswap-v3",
    fee: Number(env.VITE_DEX_FEE ?? 3000),
    deadlineMinutes: Number(env.VITE_DEX_DEADLINE_MINUTES ?? 15),
    slippageBpsDefault: Number(env.VITE_SLIPPAGE_BPS ?? 50)
  },
  features: {
    enableMocks,
    enableAdmin: true
  }
};
