# Configuration pour le XRPL Testnet
import xrpl

TESTNET_URL = "https://s.altnet.rippletest.net:51234"
JSON_RPC_CLIENT = xrpl.clients.JsonRpcClient(TESTNET_URL)

# Constantes pour les NFTs
CSGO_TAXON = 1337  # Taxon pour la collection CSGO Skins
TRANSFER_FEE = 500  # 5.00% de royalties sur les reventes (500 = 5.00%)

# Flags pour NFTokenMint
TF_TRANSFERABLE = 8  # Permet le transfert du NFT
TF_BURNABLE = 1      # Permet au créateur de brûler le NFT

# Type de credential pour KYC
KYC_CREDENTIAL_TYPE = "CSGO_KYC_VERIFIED"