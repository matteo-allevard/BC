const env = import.meta.env;

export const appConfig = {
  appName: "CSGO Skins - Tokenized Platform",
  chain: {
    name: "XRPL Testnet",
    networkUrl: "https://s.altnet.rippletest.net:51234",
    explorerUrl: "https://testnet.xrpl.org",
    nativeSymbol: "XRP"
  },
  indexer: {
    baseUrl: env.VITE_INDEXER_BASE_URL ?? "http://localhost:5000",
    pollIntervalMs: 60_000
  },
  xrpl: {
    kycIssuer: env.VITE_KYC_ISSUER ?? "",
    nftIssuer: env.VITE_NFT_ISSUER ?? ""
  },
  features: {}
};
