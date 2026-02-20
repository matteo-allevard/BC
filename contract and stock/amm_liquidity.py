import xrpl
from config import TESTNET_URL
from utils import get_client
from account import get_account_from_seed

class LiquidityPool:
    """Gestionnaire de pool de liquidité pour le trading de skins"""
    
    def __init__(self, operator_seed):
        """
        Initialise l'opérateur du pool
        :param operator_seed: Seed du compte qui va créer le pool
        """
        self.wallet = get_account_from_seed(operator_seed)
        self.client = get_client()
        self.address = self.wallet.classic_address
        print(f"💧 Opérateur de liquidité: {self.address}")
    
    def create_pool(self, token_currency, token_issuer, token_amount, 
                    xrp_amount, trading_fee=600):
        """
        Crée un pool AMM pour échanger un token contre XRP
        
        :param token_currency: Code du token (ex: "CSGO")
        :param token_issuer: Adresse de l'émetteur du token
        :param token_amount: Quantité de tokens à fournir
        :param xrp_amount: Quantité de XRP à fournir (en drops)
        :param trading_fee: Frais de trading (600 = 0.6%)
        :return: Résultat de la transaction
        """
        
        # Vérification que l'utilisateur a les fonds nécessaires
        # et que l'émetteur a Default Ripple activé
        
        # Création de la transaction AMMCreate
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
            response = xrpl.transaction.submit_and_wait(
                amm_tx,
                self.client,
                self.wallet
            )
            print(f"✅ Pool créé avec succès!")
            return response.result
        except Exception as e:
            print(f"❌ Erreur lors de la création du pool: {e}")
            return None
    
    def deposit_liquidity(self, amm_account, token_currency, token_issuer, 
                          token_amount, xrp_amount):
        """
        Dépose plus de liquidité dans un pool existant
        """
        deposit_tx = xrpl.models.transactions.AMMDeposit(
            account=self.wallet.classic_address,
            amm_account=amm_account,
            amount=xrpl.models.amounts.IssuedCurrencyAmount(
                currency=token_currency,
                issuer=token_issuer,
                value=str(token_amount)
            ),
            amount2=str(xrp_amount)
        )
        
        try:
            response = xrpl.transaction.submit_and_wait(
                deposit_tx,
                self.client,
                self.wallet
            )
            return response.result
        except Exception as e:
            print(f"❌ Erreur lors du dépôt: {e}")
            return None