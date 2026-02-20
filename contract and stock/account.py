import xrpl
from config import TESTNET_URL
from utils import get_client

def create_testnet_account():
    """Crée un nouveau compte sur le Testnet avec des XRP de test"""
    client = get_client()
    wallet = xrpl.wallet.generate_faucet_wallet(client)
    print(f"✅ Compte créé: {wallet.classic_address}")
    print(f"🔑 Seed: {wallet.seed}")
    print(f"💰 Balance: {get_balance(wallet.classic_address)} drops")
    return wallet

def get_balance(address):
    """Récupère le solde d'un compte"""
    client = get_client()
    try:
        response = client.request(xrpl.models.requests.AccountInfo(
            account=address,
            ledger_index="validated"
        ))
        return response.result['account_data']['Balance']
    except:
        return "0"

def get_account_from_seed(seed):
    """Récupère un wallet à partir d'une seed"""
    return xrpl.wallet.Wallet.from_seed(seed)