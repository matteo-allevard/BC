import xrpl
from config import TESTNET_URL
from utils import get_client
from account import get_account_from_seed

class LiquidityPool:
    def __init__(self, operator_seed):
        self.wallet = get_account_from_seed(operator_seed)
        self.client = get_client()
        self.address = self.wallet.classic_address
        print(f"💧 Opérateur de liquidité: {self.address}")

    def create_trustline(self, token_currency, token_issuer, limit="1000000"):
        trustline_tx = xrpl.models.transactions.TrustSet(
            account=self.wallet.classic_address,
            limit_amount=xrpl.models.amounts.IssuedCurrencyAmount(
                currency=token_currency,
                issuer=token_issuer,
                value=limit
            )
        )
        try:
            response = xrpl.transaction.submit_and_wait(trustline_tx, self.client, self.wallet)
            print(f"✅ Trustline créée")
            return response.result
        except Exception as e:
            print(f"❌ Erreur trustline: {e}")
            return None

    def create_pool(self, token_currency, token_issuer, token_amount, xrp_amount, trading_fee=500):
        amm_tx = xrpl.models.transactions.AMMCreate(
            account=self.wallet.classic_address,
            amount=xrpl.models.amounts.IssuedCurrencyAmount(
                currency=token_currency,
                issuer=token_issuer,
                value=str(token_amount)
            ),
            amount2=str(xrp_amount),
            trading_fee=trading_fee
        )
        print(f"🏊 Création du pool AMM {token_currency}/XRP")
        print(f"   {token_amount} {token_currency} + {int(xrp_amount)/1000000} XRP")
        try:
            response = xrpl.transaction.submit_and_wait(amm_tx, self.client, self.wallet)
            print(f"✅ Pool créé avec succès!")
            return response.result
        except Exception as e:
            print(f"❌ Erreur lors de la création du pool: {e}")
            return None

    def swap_xrp_for_token(self, token_currency, token_issuer, xrp_amount_drops):
        payment_tx = xrpl.models.transactions.Payment(
            account=self.wallet.classic_address,
            destination=self.wallet.classic_address,
            amount=xrpl.models.amounts.IssuedCurrencyAmount(
                currency=token_currency,
                issuer=token_issuer,
                value="50"
            ),
            send_max=str(xrp_amount_drops),
            flags=xrpl.models.transactions.PaymentFlag.TF_PARTIAL_PAYMENT
        )
        print(f"🔄 Swap {int(xrp_amount_drops)/1000000} XRP -> {token_currency}")
        try:
            response = xrpl.transaction.submit_and_wait(payment_tx, self.client, self.wallet)
            print("✅ Swap effectué!")
            return response.result
        except Exception as e:
            print(f"❌ Erreur swap: {e}")
            return None

    def swap_token_for_xrp(self, token_currency, token_issuer, token_amount):
        payment_tx = xrpl.models.transactions.Payment(
            account=self.wallet.classic_address,
            destination=self.wallet.classic_address,
            amount="5000000",
            send_max=xrpl.models.amounts.IssuedCurrencyAmount(
                currency=token_currency,
                issuer=token_issuer,
                value=str(token_amount)
            ),
            flags=xrpl.models.transactions.PaymentFlag.TF_PARTIAL_PAYMENT
        )
        print(f"🔄 Swap {token_amount} {token_currency} -> XRP")
        try:
            response = xrpl.transaction.submit_and_wait(payment_tx, self.client, self.wallet)
            print("✅ Swap effectué!")
            return response.result
        except Exception as e:
            print(f"❌ Erreur swap: {e}")
            return None

    def get_amm_info(self, token_currency, token_issuer):
        request = xrpl.models.requests.AMMInfo(
            asset=xrpl.models.currencies.XRP(),
            asset2=xrpl.models.currencies.IssuedCurrency(
                currency=token_currency,
                issuer=token_issuer
            )
        )
        try:
            response = self.client.request(request)
            return response.result
        except Exception as e:
            print(f"❌ Erreur AMM info: {e}")
            return None
