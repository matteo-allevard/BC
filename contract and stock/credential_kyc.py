import xrpl
from config import KYC_CREDENTIAL_TYPE
from utils import get_client, str_to_hex
from account import get_account_from_seed

class KYCManager:
    """Gestionnaire KYC avec Credentials XRPL"""
    
    def __init__(self, issuer_seed):
        """
        Initialise l'émetteur de credentials KYC
        :param issuer_seed: Seed du compte qui émet les credentials
        """
        self.wallet = get_account_from_seed(issuer_seed)
        self.client = get_client()
        self.address = self.wallet.classic_address
        print(f"🔐 Émetteur KYC initialisé: {self.address}")
    
    def issue_kyc_credential(self, subject_address, expiry_date=None, uri_data=None):
        """
        Émet un credential KYC pour un utilisateur
        
        :param subject_address: Adresse de l'utilisateur à certifier
        :param expiry_date: Date d'expiration (format: "2025-12-31T00:00:00Z")
        :param uri_data: URI optionnel avec données supplémentaires
        :return: Résultat de la transaction
        """
        
        # Conversion du type de credential en hexadécimal
        credential_type_hex = str_to_hex(KYC_CREDENTIAL_TYPE)
        
        # Construction de la transaction CredentialCreate
        credential_tx = xrpl.models.transactions.CredentialCreate(
            account=self.wallet.classic_address,
            subject=subject_address,
            credential_type=credential_type_hex,
            # Expiration optionnelle (nécessite conversion en timestamp XRPL)
        )
        
        # Ajout de l'expiration si fournie
        if expiry_date:
            # Conversion de date ISO en timestamp XRPL (secondes depuis 2000-01-01)
            # À implémenter selon vos besoins
            pass
        
        print(f"📝 Émission du credential KYC pour {subject_address}")
        
        try:
            response = xrpl.transaction.submit_and_wait(
                credential_tx,
                self.client,
                self.wallet
            )
            print(f"✅ Credential émis avec succès!")
            return response.result
        except Exception as e:
            print(f"❌ Erreur lors de l'émission: {e}")
            return None
    
    def revoke_kyc_credential(self, subject_address):
        """
        Révoque un credential KYC (blacklist)
        
        :param subject_address: Adresse de l'utilisateur à blacklister
        :return: Résultat de la transaction
        """
        credential_type_hex = str_to_hex(KYC_CREDENTIAL_TYPE)
        
        revoke_tx = xrpl.models.transactions.CredentialDelete(
            account=self.wallet.classic_address,
            subject=subject_address,
            credential_type=credential_type_hex
        )
        
        print(f"🚫 Révocation du credential KYC pour {subject_address}")
        
        try:
            response = xrpl.transaction.submit_and_wait(
                revoke_tx,
                self.client,
                self.wallet
            )
            print(f"✅ Credential révoqué avec succès!")
            return response.result
        except Exception as e:
            print(f"❌ Erreur lors de la révocation: {e}")
            return None
    
    def list_issued_credentials(self, accepted_only=None):
        """
        Liste tous les credentials émis
        :param accepted_only: Filtrer par acceptés (True/False) ou None pour tous
        :return: Liste des credentials
        """
        # Requête pour obtenir les credentials
        # Utilisation de account_objects avec type credential
        request = xrpl.models.requests.AccountObjects(
            account=self.wallet.classic_address,
            type="credential",
            ledger_index="validated"
        )
        
        response = self.client.request(request)
        credentials = response.result.get('account_objects', [])
        
        # Filtrage par statut d'acceptation si demandé
        if accepted_only is not None:
            filtered = []
            for cred in credentials:
                is_accepted = cred.get('Flags', 0) & 0x00010000 != 0  # lsfAccepted flag
                if is_accepted == accepted_only:
                    filtered.append(cred)
            return filtered
        
        return credentials