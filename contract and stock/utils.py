import xrpl
from config import JSON_RPC_CLIENT

def get_client():
    """Retourne le client JSON-RPC pour le Testnet"""
    return JSON_RPC_CLIENT

def str_to_hex(string):
    """Convertit une chaîne en hexadécimal pour les URI"""
    return xrpl.utils.str_to_hex(string)

def hex_to_str(hex_string):
    """Convertit l'hexadécimal en chaîne lisible"""
    try:
        return bytes.fromhex(hex_string).decode('utf-8')
    except:
        return hex_string

def get_account_balance(address):
    """Récupère le solde XRP d'un compte"""
    client = get_client()
    response = client.request(xrpl.models.requests.AccountInfo(
        account=address,
        ledger_index="validated"
    ))
    return response.result['account_data']['Balance']