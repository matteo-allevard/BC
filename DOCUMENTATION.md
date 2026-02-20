# Tokenized Asset Management Platform - XRPL

Plateforme de tokenisation d'actifs (skins CSGO) sur le XRP Ledger avec gestion de compliance KYC et trading via AMM.

---

## Architecture du Projet

```
BC/
├── contract and stock/    # Partie 1 & 4: Smart contracts XRPL + AMM
├── indexer/               # Partie 2: API de synchronisation blockchain
└── frontend/              # Partie 3: Interface utilisateur React
```

---

## Partie 1: Smart Contracts XRPL

**Dossier:** `contract and stock/`

### Fichiers

| Fichier | Description |
|---------|-------------|
| `config.py` | Configuration XRPL (URL testnet, constantes) |
| `utils.py` | Fonctions utilitaires (client, conversions hex) |
| `account.py` | Gestion des comptes XRPL (création, balance) |
| `nft_skins.py` | Classe `CSGOSkinNFT` pour mint/burn/list des NFTs |
| `credential_kyc.py` | Classe `KYCManager` pour émettre/révoquer des credentials |
| `verify_kyc.py` | Fonctions de vérification KYC (whitelist/blacklist) |
| `token_fungible.py` | Classe `FungibleToken` pour tokens IoU |
| `amm_liquidity.py` | Classe `LiquidityPool` pour AMM (pools, swaps) |
| `main.py` | Script de démonstration complet |

### Fonctionnalités

1. **NFTs (XLS-20):** Tokenisation des skins CSGO avec métadonnées
2. **Credentials XRPL:** Système KYC on-chain
3. **Tokens fungibles (IoU):** Token CSG pour représenter la valeur
4. **AMM natif XRPL:** Pools de liquidité et swaps

---

## Partie 2: Indexer

**Dossier:** `indexer/`

### Fichiers

| Fichier | Description |
|---------|-------------|
| `app.py` | API Flask pour synchroniser les données XRPL |
| `requirements.txt` | Dépendances Python |

### Endpoints API

| Endpoint | Description |
|----------|-------------|
| `GET /status` | Statut de l'indexer et dernière sync |
| `GET /portfolio/<address>` | Holdings d'une adresse (XRP + NFTs) |
| `GET /compliance/<address>?kyc_issuer=...` | Statut KYC d'une adresse |
| `GET /assets?issuer=...` | Liste des NFTs d'un issuer |
| `GET /trades?address=...` | Transactions récentes |
| `GET /nfts/<address>` | NFTs possédés par une adresse |
| `GET /account/<address>` | Info compte (balance, nb NFTs) |
| `GET /oracle/<asset_id>` | Prix oracle simulé |
| `GET /kyc/check?address=...&issuer=...` | Vérification KYC détaillée |

---

## Partie 3: Frontend

**Dossier:** `frontend/`

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Vue d'ensemble (portfolio, trades, compliance) |
| Assets | `/assets` | Liste des actifs tokenisés |
| Asset Detail | `/assets/:id` | Détail d'un actif |
| Tokenize | `/tokenize` | Instructions pour mint des NFTs |
| Trade | `/trade` | Instructions pour trader via AMM |
| Admin | `/admin` | Gestion KYC (pour l'issuer) |

### Configuration

Fichier `.env.local`:
```
VITE_INDEXER_BASE_URL=http://localhost:5000
VITE_KYC_ISSUER=<adresse_kyc_issuer>
VITE_NFT_ISSUER=<adresse_nft_issuer>
```

---

## Partie 4: DEX / AMM

**Intégré dans:** `contract and stock/amm_liquidity.py`

### Fonctionnalités

1. **Création de pool:** `create_pool(token, issuer, amount, xrp_amount, fee)`
2. **Swap XRP -> Token:** `swap_xrp_for_token(token, issuer, xrp_drops)`
3. **Swap Token -> XRP:** `swap_token_for_xrp(token, issuer, amount)`
4. **Info pool:** `get_amm_info(token, issuer)`

---

## Guide d'Installation

### Prérequis

- Python 3.10+
- Node.js 18+
- npm ou yarn

### 1. Backend XRPL (contract and stock)

```bash
cd "contract and stock"
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Indexer

```bash
cd indexer
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend

```bash
cd frontend
npm install
```

---

## Guide d'Exécution

### Étape 1: Exécuter le script XRPL

```bash
cd "contract and stock"
# Activer le venv si pas déjà fait
python main.py
```

Ce script va:
1. Créer 4 comptes testnet (KYC Issuer, Token Issuer, Player, Trader)
2. Émettre des credentials KYC
3. Mint un NFT (AK-47 | Redline)
4. Créer un token fungible CSG
5. Créer un pool AMM CSG/XRP
6. Exécuter un swap de test

**Noter les adresses affichées à la fin!**

### Étape 2: Configurer le Frontend

Modifier `frontend/.env.local` avec les adresses du script:
```
VITE_INDEXER_BASE_URL=http://localhost:5000
VITE_KYC_ISSUER=<KYC_Issuer_address>
VITE_NFT_ISSUER=<Token_Issuer_address>
```

### Étape 3: Lancer l'Indexer

```bash
cd indexer
# Activer le venv
python app.py
```

L'API sera disponible sur `http://localhost:5000`

### Étape 4: Lancer le Frontend

```bash
cd frontend
npm run dev
```

Le site sera disponible sur `http://localhost:5173`

### Étape 5: Tester

1. Ouvrir `http://localhost:5173`
2. Entrer l'adresse du **Trader** pour voir le portfolio avec les trades
3. Naviguer dans les différentes pages

---

## Démonstration des Fonctionnalités

### Compliance (KYC)

- Le panel "Compliance" montre le statut KYC de l'adresse connectée
- KYC = credential émis par le KYC Issuer
- Whitelist = credential accepté par l'utilisateur
- Sans whitelist, l'accès aux pages Trade/Tokenize est bloqué

### Portfolio

- Affiche le solde XRP
- Affiche les NFTs possédés
- Synchronisé via l'indexer toutes les 60 secondes

### Assets

- Liste les NFTs mintés par le Token Issuer
- Filtre par type (Fungible/NFT)

### Trades

- Affiche les transactions récentes de l'adresse
- Types: Payment, NFTokenMint, AMMCreate, etc.

---

## Structure des Données XRPL

### NFT (XLS-20)

```json
{
  "NFTokenID": "000801F4...",
  "URI": "{\"name\":\"AK-47 | Redline (FT)\",\"wpn\":\"AK-47\",...}",
  "Issuer": "rJWvwj...",
  "Taxon": 1337
}
```

### Credential KYC

```json
{
  "LedgerEntryType": "Credential",
  "Subject": "ra1yQc...",
  "Issuer": "rU6Fck...",
  "CredentialType": "4353474F5F4B59435F56455249464945D",
  "Flags": 65536
}
```

### AMM Pool

```json
{
  "Asset": {"currency": "XRP"},
  "Asset2": {"currency": "CSG", "issuer": "rJWvwj..."},
  "TradingFee": 500,
  "LPTokenBalance": "..."
}
```

---

## Explorateur XRPL

Pour vérifier les transactions on-chain:
- **Testnet Explorer:** https://testnet.xrpl.org
- Rechercher une adresse pour voir ses NFTs, trustlines, transactions

---

## Résumé des Parties

| Partie | Description | Statut |
|--------|-------------|--------|
| 1. Smart Contracts | NFTs, Credentials, Tokens sur XRPL | OK |
| 2. Indexer | API Flask synchronisant les données XRPL | OK |
| 3. Frontend | Interface React avec dashboard, portfolio | OK |
| 4. DEX/AMM | Pool de liquidité et swaps via AMM XRPL | OK |

---
