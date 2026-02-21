# Guide de Présentation - Tokenized Asset Management Platform

---

## Glossaire – Termes techniques à connaître

> Lis ça en premier. Tous les termes en **gras** dans ce doc sont définis ici.

| Terme | Explication simple |
|-------|-------------------|
| **XRPL** | XRP Ledger – la blockchain qu'on utilise. Créée par Ripple. Alternative à Ethereum. |
| **XRP** | La monnaie native de XRPL, comme l'ETH sur Ethereum. |
| **EVM** | Ethereum Virtual Machine – le moteur des blockchains comme Ethereum, Polygon, etc. On n'a pas choisi EVM. |
| **AMM** | Automated Market Maker – un système d'échange automatique sans intermédiaire humain. C'est un "robot" qui fixe le prix selon la quantité disponible dans le pool. Sur XRPL c'est natif au protocole. |
| **Pool de liquidité** | Un coffre commun qui contient deux actifs (ex: CSG + XRP). Les utilisateurs échangent dedans. Plus il y a d'actifs dans le coffre, moins le prix bouge. |
| **Swap** | Échanger un token contre un autre via le pool. Ex: "je donne 1 XRP, je reçois des CSG". |
| **NFT** | Non-Fungible Token – token unique et non divisible. Un seul exemplaire peut exister. Sur XRPL : standard XLS-20. |
| **Token fungible** | Token divisible et interchangeable. 1 CSG = 1 CSG peu importe lequel. Comme de l'argent. |
| **IoU** | "I Owe You" (je te dois). Sur XRPL, les tokens fungibles sont des créances: l'issuer te "doit" la valeur du token. |
| **KYC** | Know Your Customer – vérification d'identité. Obligatoire pour accéder à la plateforme. |
| **Credential XRPL** | Un objet natif du protocole XRPL qui certifie qu'un compte a été vérifié par un issuer. C'est le KYC on-chain. |
| **Whitelist** | Liste des adresses autorisées à trader. Une adresse est whitelistée quand elle a accepté son credential KYC. |
| **Blacklist** | Adresses révoquées/interdites. L'issuer supprime le credential pour bloquer l'accès. |
| **On-chain** | Quelque chose qui existe réellement dans la blockchain, vérifiable par tout le monde. Opposé de "dans notre base de données". |
| **Indexer** | Un programme qui lit la blockchain en continu et stocke/expose les données pour le frontend. Comme un intermédiaire de traduction entre la blockchain et l'interface. |
| **API REST** | Interface de communication entre deux programmes via HTTP. L'indexer expose des URLs que le frontend appelle pour avoir les données. |
| **Endpoint** | Une URL précise de l'API. Ex: `/portfolio/rw9e9...` est un endpoint qui retourne le portfolio d'une adresse. |
| **Oracle** | Source de données externe qui injecte un prix "réel" dans le système. Ex: le prix d'un skin CSGO vient de l'extérieur, pas de la blockchain. |
| **Testnet** | Réseau de test. Les XRP n'ont pas de valeur réelle, c'est juste pour tester. |
| **Explorer** | Site web qui permet de voir toutes les transactions d'une blockchain. `testnet.xrpl.org` pour nous. |
| **Issuer** | Le compte qui émet/crée les tokens ou credentials. Autorité centrale de notre plateforme. |
| **Flask** | Framework Python pour créer des APIs web rapidement. C'est ce qu'on utilise pour l'indexer. |
| **React** | Framework JavaScript pour créer des interfaces web. C'est ce qu'on utilise pour le frontend. |

---

## Avant de commencer

**Ouvrir avant la présentation:**
- Terminal 1: `cd indexer && python app.py` → lance l'**indexer**
- Terminal 2: `cd frontend && npm run dev` → lance l'interface
- Navigateur: `http://localhost:5173` → l'interface
- XRPL Explorer: `https://testnet.xrpl.org` → pour montrer les transactions on-chain
- Adresse Trader à portée: `rw9e9zt7hFYa7qF7QaviqhgDj1Ejs3dXX3`

---

## 1. Choix Technique – Pourquoi XRPL ?

**Ce qu'il faut dire:**
> "On a choisi XRPL plutôt qu'une blockchain **EVM** (Ethereum) pour plusieurs raisons. XRPL a un **AMM** natif dans le protocole — pas besoin de déployer Uniswap nous-mêmes. Les **NFTs** (XLS-20) et les **credentials KYC** sont aussi natifs, donc toute la logique est **on-chain** sans avoir à coder de smart contracts complexes. Les frais de transaction sont très bas (quelques centimes) et une transaction est confirmée en 3-5 secondes. On cible des utilisateurs qui échangent des actifs de valeur, donc le coût comptait beaucoup."

**Si le prof demande "pourquoi pas Ethereum ?"**
> "Sur **EVM** on aurait dû coder et déployer des smart contracts Solidity pour chaque fonctionnalité (ERC-20 pour les tokens, ERC-721 pour les **NFTs**, un système KYC custom...). Sur **XRPL** tout ça existe déjà dans le protocole, ce qui simplifie l'architecture et réduit les risques de bugs."

---

## 2. Actif Tokenisé – Les Skins CSGO

**Ce qu'il faut dire:**
> "On a choisi de tokeniser des skins Counter-Strike. C'est un marché réel avec des prix publics, des millions d'utilisateurs, et des actifs avec une vraie valeur — certains skins valent plusieurs milliers d'euros. Notre plateforme supporte les deux types de tokenisation demandés."

**Les deux types — ce qu'il faut montrer:**

- **NFT** (token unique): Chaque skin précis est un **NFT**. Exemple: "AK-47 | Redline (Field-Tested)" — un seul exemplaire peut exister, il est non divisible.
  → Montrer dans la page **Assets** sur le frontend

- **Token fungible** (token divisible): Le token **CSG** représente une unité de valeur échangeable sur la plateforme. Comme une action d'entreprise, 1 CSG vaut autant qu'un autre CSG.
  → Montrer dans le terminal (output de `main.py`), ou dans le portfolio du Trader

> **IoU** = "I Owe You". Sur **XRPL**, les tokens fungibles sont des reconnaissances de dette : l'**issuer** te "doit" la valeur du token. C'est différent d'Ethereum où le token existe de façon autonome dans un smart contract.

---

## 3. KYC & Compliance On-Chain

**Ce qu'il faut montrer:**
1. Frontend → entrer l'adresse Trader → voir le panel Compliance en bas à gauche
2. Montrer "KYC: APPROVED" et "Whitelist: BLOCKED"
3. Aller sur `https://testnet.xrpl.org` → chercher l'adresse Player `ra1yQcKBuwhPnzKPqPFbSfZW6QqLtyNLkH` → onglet "Credentials"
4. Aller sur Trade ou Tokenize → montrer le message "NOT WHITELISTED" qui bloque la page

**Ce qu'il faut dire:**
> "Le **KYC** est géré via les **XRPL Credentials**, une feature native du protocole. Notre compte **KYC Issuer** émet un **credential** sur la blockchain pour un utilisateur. Ce credential est visible **on-chain** par tout le monde — pas dans notre base de données. Quand l'utilisateur accepte le credential, il est **whitelisté** et peut accéder à la plateforme. Si on révoque le credential, il est immédiatement **blacklisté** et bloqué. On peut vérifier tout ça en direct sur l'explorer."

> **Pourquoi "Whitelist BLOCKED" dans la démo ?**
> Sur XRPL, accepter un credential nécessite une transaction signée par l'utilisateur lui-même (pour qu'il consente). Dans notre script automatique, on n'a pas simulé cette étape côté user. Le credential est bien émis (KYC APPROVED), mais pas encore accepté (BLOCKED). C'est le flow normal du protocole.

**Si le prof demande "comment la blacklist est enforced on-chain ?"**
> "L'**indexer** vérifie l'état du **credential** à chaque sync en lisant directement la blockchain. Si le credential n'existe plus, l'utilisateur est bloqué. Ce n'est pas une variable dans notre code, c'est l'état réel du ledger."

---

## 4. Trading On-Chain – AMM

> **AMM** = Automated Market Maker. C'est un robot qui gère l'échange de tokens automatiquement via un **pool de liquidité**. Pas besoin d'un humain en face pour acheter/vendre — le pool joue le rôle d'intermédiaire.

**Ce qu'il faut montrer:**
1. Montrer le output du terminal après `python main.py` — chercher les lignes "AMMCreate" et "AMMSwap"
2. Sur l'explorer XRPL, chercher l'adresse Trader `rw9e9zt7hFYa7qF7QaviqhgDj1Ejs3dXX3` → voir les transactions AMMCreate et AMMSwap
3. Frontend → Dashboard → "Recent Trades" → voir le **swap** affiché

**Ce qu'il faut dire:**
> "On a créé un **pool de liquidité** CSG/XRP sur l'**AMM** natif de XRPL. On a mis la liquidité initiale nous-mêmes : 100 tokens CSG et 10 XRP dans le coffre. Ensuite on a exécuté un **swap** : 1 XRP contre des CSG. Le prix s'est calculé automatiquement selon le ratio du pool. Tout ça est **on-chain** et visible sur l'explorer. L'accès au trading est conditionné par le **KYC** — sans whitelist, les pages Trade/Tokenize sont bloquées."

> **Pool de liquidité** = un coffre commun avec deux actifs (CSG + XRP). Quand quelqu'un **swap**, il dépose un actif dans le coffre et récupère l'autre. Le prix se calcule avec la formule `quantité_A × quantité_B = constante`. Plus le coffre est grand, plus le prix est stable.

---

## 5. Indexer – Synchronisation On-Chain

> **Indexer** = un programme intermédiaire qui lit la blockchain régulièrement et rend les données facilement accessibles au frontend via une **API REST**. La blockchain brute c'est difficile à lire directement depuis le navigateur — l'indexer fait la traduction.

**Ce qu'il faut montrer:**
1. Montrer le terminal de l'indexer qui tourne (`python app.py`)
2. Ouvrir dans le navigateur: `http://localhost:5000/status` → voir le JSON avec le statut
3. Ouvrir: `http://localhost:5000/portfolio/rw9e9zt7hFYa7qF7QaviqhgDj1Ejs3dXX3` → portfolio en JSON
4. Ouvrir: `http://localhost:5000/trades?address=rw9e9zt7hFYa7qF7QaviqhgDj1Ejs3dXX3` → trades en JSON
5. Montrer que ces données sont les mêmes que ce qu'affiche le frontend

**Ce qu'il faut dire:**
> "L'**indexer** est une **API** Python/Flask qui tourne en arrière-plan et interroge le **XRPL** toutes les 60 secondes. Il expose des **endpoints** que le frontend appelle pour afficher les données. Si quelqu'un fait un **swap** directement sur le **DEX** sans passer par notre interface, le changement apparaît quand même dans l'app au prochain cycle de sync. C'est ça la synchronisation **on-chain** en temps réel demandée dans le sujet."

**Si le prof demande "comment tu détectes les transactions ?"**
> "On appelle la méthode `account_tx` de l'API XRPL qui retourne l'historique complet d'une adresse. On filtre par type de transaction (Payment, NFTokenMint, AMMCreate, AMMSwap) et on retourne ça au frontend."

---

## 6. Oracle

> **Oracle** = une source de données externe qui apporte une information du monde réel dans le système. La blockchain ne peut pas aller chercher elle-même le prix d'un skin sur Steam — l'oracle fait ce pont.

**Ce qu'il faut montrer:**
1. Ouvrir: `http://localhost:5000/oracle/AK47-REDLINE` dans le navigateur
2. Voir le JSON avec le prix simulé du skin
3. Sur le frontend → Assets → cliquer sur l'AK-47 → voir le prix affiché

**Ce qu'il faut dire:**
> "L'**oracle** fournit des données de prix du monde réel. Dans notre cas, il simule le prix de marché d'un skin CSGO. En production, on brancherait ça sur l'API Steam Market. L'**indexer** expose cet **endpoint** oracle, et le frontend affiche le prix sur la page de détail de chaque asset."

**Si le prof demande "c'est on-chain ou off-chain ?"**
> "Notre oracle est **off-chain** — le prix vient de l'extérieur via l'indexer. Sur XRPL il existe des oracles natifs (standard XLS-47), mais on a choisi de garder ça côté indexer pour simplifier. Le principe est identique : une source externe de vérité qui alimente l'application."

---

## 7. Frontend – Démonstration

**Ordre de passage recommandé:**

1. **Dashboard sans wallet** → montrer que le catalogue d'assets (l'AK-47) est public
2. **Se connecter** → entrer l'adresse Trader `rw9e9zt7hFYa7qF7QaviqhgDj1Ejs3dXX3`
3. **Dashboard avec wallet** → Portfolio (balance XRP + NFTs), panel Compliance (KYC/Whitelist/Blacklist), Indexer heartbeat, Recent Trades
4. **Assets** → Filtres All/Fungible/NFT, carte AK-47
5. **Asset Detail** → Cliquer AK-47 → voir prix **oracle**, métadonnées
6. **Trade** → message "NOT WHITELISTED" bloque la page (= **compliance enforced**)
7. **Admin** → montrer les commandes KYC disponibles pour l'**issuer**

**Ce qu'il faut dire:**
> "L'interface est connectée à l'**indexer**. On saisit juste une adresse XRPL pour se connecter — XRPL n'a pas de MetaMask, les wallets sont gérés par des apps séparées. Le frontend interroge l'indexer toutes les 60 secondes et affiche l'état réel de la blockchain."

---

## 8. Architecture Globale (résumé si le prof demande)

```
XRPL Testnet  ← la blockchain, source de vérité
     ↑↓
Indexer Flask  ← lit la blockchain, expose une API REST
     ↑↓
Frontend React ← affiche les données à l'utilisateur
     ↑
Utilisateur
```

> "Trois couches : la blockchain **XRPL** comme source de vérité, l'**indexer** comme pont qui lit la blockchain et expose une **API REST**, et le frontend **React** qui affiche tout ça. Toute la logique métier — **KYC**, **NFT**, **AMM** — existe **on-chain**, pas dans notre code."

---

## Questions Pièges Possibles

**"Votre KYC est vraiment on-chain ?"**
> Oui. Les **XRPL Credentials** sont des objets natifs du ledger, pas des variables dans notre code. On peut le vérifier en direct sur `testnet.xrpl.org` en cherchant n'importe quelle adresse.

**"Pourquoi le Trader est marqué BLOCKED en whitelist ?"**
> Sur XRPL, accepter un **credential** nécessite une transaction signée par l'utilisateur lui-même — pour qu'il consente explicitement. Dans notre démo automatique, on n'a pas simulé cette étape côté user. Le credential est bien émis (KYC APPROVED), mais pas encore accepté. C'est le comportement normal du protocole.

**"Vous avez hosté le frontend ?"**
> *(Si pas fait)* "On peut déployer sur Vercel en quelques minutes, la config est standard." *(Si fait, montrer l'URL)*

**"C'est quoi le Taxon dans le NFT ?"**
> Le Taxon est un numéro de collection sur XRPL. On utilise `1337` pour identifier notre collection de skins. C'est l'équivalent de l'adresse de contrat ERC-721 sur Ethereum — il permet de grouper les NFTs d'une même collection.

**"Comment vous gérez la sécurité ?"**
> La sécurité est héritée du protocole XRPL. Les **credentials** sont signés cryptographiquement par l'**issuer**, impossibles à falsifier. Les balances et **NFTs** sont stockés directement dans le ledger, personne ne peut les modifier sans la clé privée du compte.

---

## Adresses pour la Démo

| Rôle | Adresse |
|------|---------|
| KYC Issuer (émet les credentials) | `rU6FckFUjkfAWUHC1fEMUYzgknnFcSTf1c` |
| Token Issuer (émet NFTs + tokens CSG) | `rJWvwjhsJWS3AnL71nUaz2SbxxxsaSLsjP` |
| Player (possède le NFT AK-47) | `ra1yQcKBuwhPnzKPqPFbSfZW6QqLtyNLkH` |
| Trader (a créé le pool AMM + swappé) | `rw9e9zt7hFYa7qF7QaviqhgDj1Ejs3dXX3` |

**Explorer:** `https://testnet.xrpl.org/accounts/<adresse>`
