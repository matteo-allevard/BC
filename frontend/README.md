# Tokenized Asset Management Frontend

This frontend matches the course requirements: tokenization (fungible + NFT), compliance (KYC + whitelist/blacklist), on-chain trading, oracle display, and real-time indexer sync.

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Configuration

Update `frontend/src/config/appConfig.ts` with your chain, RPC, indexer, and contract addresses:
- `chain.chainId`, `chain.rpcUrl`, `chain.explorerUrl`
- `indexer.baseUrl`
- `contracts.whitelist`, `contracts.tokenFactory`, `contracts.nftFactory`, `contracts.oracle`, `contracts.dexRouter`, `contracts.dexPool`

If your contracts have different method names, update the ABI definitions in `frontend/src/config/abis.ts`.

You can also override settings via environment variables:

```\nVITE_CHAIN_NAME\nVITE_CHAIN_ID\nVITE_RPC_URL\nVITE_EXPLORER_URL\nVITE_NATIVE_SYMBOL\nVITE_INDEXER_BASE_URL\nVITE_KYC_URL\nVITE_TERMS_URL\nVITE_WHITELIST_CONTRACT\nVITE_TOKEN_FACTORY_CONTRACT\nVITE_NFT_FACTORY_CONTRACT\nVITE_ORACLE_CONTRACT\nVITE_DEX_ROUTER_CONTRACT\nVITE_DEX_POOL_CONTRACT\nVITE_DEX_TYPE\nVITE_DEX_FEE\nVITE_DEX_DEADLINE_MINUTES\nVITE_SLIPPAGE_BPS\n```

### Optional mocks

To run with mock data while the backend/indexer is not ready:

```bash
VITE_USE_MOCKS=true npm run dev
```

## What the UI covers
- Wallet connect and network guard
- KYC/whitelist/blacklist status (sidebar + admin page)
- Tokenization for fungible assets and NFTs
- On-chain swap flow with DEX quote + swap submission
- Oracle price cards
- Real-time sync via indexer polling

## Indexer endpoints expected
- `GET /status`
- `GET /assets`
- `GET /portfolio/:address`
- `GET /compliance/:address`
- `GET /trades`
- `GET /oracle/:assetId`
- `GET /dex/quote?assetIn=...&assetOut=...&amountIn=...`
- `POST /dex/swap`
- `GET /kyc/requests`
- `PATCH /kyc/requests/:id`

Adjust these paths in `frontend/src/services/indexer.ts` if your backend differs.
