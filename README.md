# CSGO Skins - Tokenized Asset Platform (XRPL)

Plateforme de tokenisation d'actifs réels sur le XRP Ledger. Ce projet permet de tokeniser des skins CSGO sous forme de NFTs avec un système KYC/whitelist on-chain.

## Architecture

```
BC/
├── frontend/          # React + TypeScript (Vite)
├── indexer/           # API Flask (Python)
└── contract and stock/  # Backend XRPL (Python)
```

## Prérequis

- Node.js 18+
- Python 3.10+
- pip

## Installation & Lancement

### 1. Backend XRPL (contract and stock)

```bash
cd "contract and stock"
pip install -r requirements.txt
python main.py
```

Cela va:
- Créer des comptes testnet
- Émettre des credentials KYC
- Minter des NFTs de skins CSGO
- Créer un pool de liquidité AMM

### 2. Indexer API

```bash
cd indexer
pip install -r requirements.txt
python app.py
```

L'API sera disponible sur `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173`

## Configuration

### Frontend (.env.local)

```env
VITE_INDEXER_BASE_URL=http://localhost:5000
VITE_KYC_ISSUER=rXXXXXXXX  # Adresse de l'émetteur KYC
VITE_NFT_ISSUER=rXXXXXXXX  # Adresse de l'émetteur NFT
```

## Fonctionnalités

### Tokenisation (XLS-20 NFTs)
- Mint de skins CSGO en tant que NFTs sur XRPL
- Métadonnées stockées dans l'URI du NFT

### KYC / Whitelist / Blacklist
- Utilisation des Credentials XRPL
- Émission de credentials KYC par un émetteur autorisé
- Révocation = Blacklist

### Trading (XRPL AMM)
- Pool de liquidité natif XRPL
- Trading entre utilisateurs whitelistés

### Indexer
- Synchronisation toutes les 60 secondes
- API REST pour le frontend
- Détection des trades externes

## API Endpoints (Indexer)

| Endpoint | Description |
|----------|-------------|
| GET /status | Status de l'indexer |
| GET /portfolio/:address | Holdings d'une adresse |
| GET /compliance/:address | Statut KYC/whitelist |
| GET /nfts/:address | NFTs d'une adresse |
| GET /account/:address | Info du compte |
| GET /trades | Transactions récentes |
| GET /oracle/:assetId | Prix d'un actif |

## Choix Technique: XRPL

Nous avons choisi XRPL car:
- NFTs natifs (XLS-20) sans smart contracts
- AMM intégré au protocole
- Credentials natifs pour KYC
- Frais de transaction très bas
- Finalité rapide (~4 secondes)

## Équipe

- Partie 1 (Smart Contracts): Backend XRPL Python
- Partie 2 (Indexer): API Flask + Synchronisation
- Partie 3 (Frontend): React + TypeScript
- Partie 4 (DEX/AMM): Intégration XRPL AMM
