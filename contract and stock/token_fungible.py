import xrpl
from utils import get_client
from account import get_account_from_seed

class FungibleToken:
    def __init__(self, issuer_seed):
        self.wallet = get_account_from_seed(issuer_seed)
        self.client = get_client()
        self.address = self.wallet.classic_address
        print(f"🪙 Token issuer: {self.address}")

    def setup_issuer(self):
        """Active DefaultRipple pour permettre les transfers de tokens"""
        settings_tx = xrpl.models.transactions.AccountSet(
            account=self.wallet.classic_address,
            set_flag=xrpl.models.transactions.AccountSetAsfFlag.ASF_DEFAULT_RIPPLE
        )
        try:
            response = xrpl.transaction.submit_and_wait(settings_tx, self.client, self.wallet)
            print("✅ DefaultRipple activé")
            return response.result
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return None

    def create_trustline(self, holder_seed, currency, limit="1000000"):
        """Crée une trustline pour qu'un compte puisse recevoir le token"""
        holder_wallet = get_account_from_seed(holder_seed)
        trustline_tx = xrpl.models.transactions.TrustSet(
            account=holder_wallet.classic_address,
            limit_amount=xrpl.models.amounts.IssuedCurrencyAmount(
                currency=currency,
                issuer=self.wallet.classic_address,
                value=limit
            )
        )
        try:
            response = xrpl.transaction.submit_and_wait(trustline_tx, self.client, holder_wallet)
            print(f"✅ Trustline créée pour {holder_wallet.classic_address}")
            return response.result
        except Exception as e:
            print(f"❌ Erreur trustline: {e}")
            return None

    def send_tokens(self, destination, currency, amount):
        """Envoie des tokens à une adresse"""
        payment_tx = xrpl.models.transactions.Payment(
            account=self.wallet.classic_address,
            destination=destination,
            amount=xrpl.models.amounts.IssuedCurrencyAmount(
                currency=currency,
                issuer=self.wallet.classic_address,
                value=str(amount)
            )
        )
        try:
            response = xrpl.transaction.submit_and_wait(payment_tx, self.client, self.wallet)
            print(f"✅ {amount} {currency} envoyés à {destination}")
            return response.result
        except Exception as e:
            print(f"❌ Erreur envoi: {e}")
            return None
