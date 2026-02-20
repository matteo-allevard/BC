import xrpl
from config import TESTNET_URL, CSGO_TAXON, TRANSFER_FEE, TF_TRANSFERABLE
from utils import get_client, str_to_hex
from account import get_account_from_seed

class CSGOSkinNFT:
    """Classe pour gérer les skins CSGO en tant que NFTs sur XRPL"""
    
    def __init__(self, issuer_seed):
        """
        Initialise l'émetteur des skins
        :param issuer_seed: Seed du compte qui va créer les NFTs
        """
        self.wallet = get_account_from_seed(issuer_seed)
        self.client = get_client()
        self.address = self.wallet.classic_address
        print(f"🎮 Émetteur initialisé: {self.address}")
    
    def mint_skin(self, skin_name, skin_data, flags=TF_TRANSFERABLE, 
                  transfer_fee=TRANSFER_FEE, taxon=CSGO_TAXON):
        """
        Crée un nouveau skin CSGO en tant que NFT
        
        :param skin_name: Nom du skin (ex: "AK-47 | Redline")
        :param skin_data: Dictionnaire contenant les métadonnées du skin
        :param flags: Flags du NFT (transferable, burnable, etc.)
        :param transfer_fee: Frais de royalties (0-50000)
        :param taxon: Identifiant de collection
        :return: Résultat de la transaction et Token ID
        """
        
        # Construction de l'URI avec les métadonnées du skin (VERSION RACCOURCIE)
        # On garde seulement l'essentiel pour respecter la limite de 512 caractères
        metadata = {
            "name": skin_name[:50],  # Tronquer le nom si trop long
            "wpn": skin_data.get("weapon", ""),
            "skn": skin_data.get("skin", ""),
            "cond": skin_data.get("condition", ""),
            "float": skin_data.get("float", 0),
            "pattern": skin_data.get("pattern", 0)
        }

        # Pour ce prototype, on encode en JSON dans l'URI
        import json
        uri_data = json.dumps(metadata)  # On enlève le préfixe "data:..."
        if len(uri_data) > 500:  # Si encore trop long
            # Version ultra courte
            metadata = {
                "n": skin_name[:30],
                "f": skin_data.get("float", 0),
                "p": skin_data.get("pattern", 0)
            }
            uri_data = json.dumps(metadata)

        uri_hex = str_to_hex(uri_data)
        print(f"URI length: {len(uri_data)} caractères")  # Debug
        
        # Création de la transaction NFTokenMint
        mint_tx = xrpl.models.transactions.NFTokenMint(
            account=self.wallet.classic_address,
            uri=uri_hex,
            flags=flags,
            transfer_fee=transfer_fee,
            nftoken_taxon=taxon
        )
        
        print(f"🔨 Minting skin: {skin_name}")
        
        try:
            # Soumission de la transaction
            response = xrpl.transaction.submit_and_wait(
                mint_tx, 
                self.client, 
                self.wallet
            )
            
            # Extraction du Token ID depuis les métadonnés de la transaction
            # Note: Le Token ID est disponible dans les métadonnées du ledger
            token_id = None
            if response.result.get('meta'):
                # Recherche du NFTokenID dans les métadonnées
                for node in response.result['meta'].get('AffectedNodes', []):
                    if 'CreatedNode' in node:
                        node_data = node['CreatedNode']
                        if node_data.get('LedgerEntryType') == 'NFToken':
                            token_id = node_data['NewFields'].get('NFTokenID')
                            break
            
            print(f"✅ Skin minté avec succès! Token ID: {token_id}")
            return response.result, token_id
            
        except Exception as e:
            print(f"❌ Erreur lors du mint: {e}")
            return None, None
    
    def get_owned_skins(self, address=None):
        """
        Récupère la liste des NFTs possédés par une adresse
        :param address: Adresse à vérifier (celle de l'émetteur par défaut)
        :return: Liste des NFTs
        """
        if address is None:
            address = self.wallet.classic_address
        
        request = xrpl.models.requests.AccountNFTs(
            account=address,
            ledger_index="validated"
        )
        
        response = self.client.request(request)
        nfts = response.result.get('account_nfts', [])
        
        print(f"📦 {len(nfts)} NFTs trouvés pour {address}")
        for nft in nfts:
            # Décodage de l'URI si disponible
            uri = nft.get('URI')
            if uri:
                try:
                    decoded = bytes.fromhex(uri).decode('utf-8')
                    nft['URI_decoded'] = decoded
                except:
                    pass
        
        return nfts
    
    def burn_skin(self, token_id):
        """
        Détruit un skin (le brûle)
        :param token_id: ID du NFT à détruire
        :return: Résultat de la transaction
        """
        burn_tx = xrpl.models.transactions.NFTokenBurn(
            account=self.wallet.classic_address,
            nftoken_id=token_id
        )
        
        print(f"🔥 Burning skin: {token_id}")
        
        try:
            response = xrpl.transaction.submit_and_wait(
                burn_tx,
                self.client,
                self.wallet
            )
            print("✅ Skin brûlé avec succès!")
            return response.result
        except Exception as e:
            print(f"❌ Erreur lors du burn: {e}")
            return None
    
    def create_sell_offer(self, token_id, amount_in_drops, destination=None):
        """
        Crée une offre de vente pour un skin
        :param token_id: ID du NFT à vendre
        :param amount_in_drops: Prix en drops (1 XRP = 1,000,000 drops)
        :param destination: Adresse spécifique (optionnel, pour vente privée)
        :return: Résultat de la transaction
        """
        # Création d'une offre de vente
        # Note: Pour une implémentation complète, utiliser NFTokenCreateOffer
        # avec amount spécifié
        
        # Cette fonction nécessite l'amendement fixNFTokenNegotiation
        # Version simplifiée pour le prototype
        print(f"💰 Création d'offre de vente pour {token_id} à {amount_in_drops} drops")
        print("⚠️  Implémentation complète à venir avec NFTokenCreateOffer")
        return None