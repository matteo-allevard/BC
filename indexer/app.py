from flask import Flask, jsonify, request
from flask_cors import CORS
import xrpl
from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountNFTs, AccountInfo, AccountObjects, AccountTx
import threading
import time
import json

app = Flask(__name__)
CORS(app)

TESTNET_URL = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(TESTNET_URL)

data_store = {
    "assets": [],
    "trades": [],
    "last_sync": None,
}

KYC_CREDENTIAL_TYPE = "CSGO_KYC_VERIFIED"

def hex_to_str(hex_string):
    try:
        return bytes.fromhex(hex_string).decode('utf-8')
    except:
        return hex_string

def get_account_balance(address):
    try:
        response = client.request(AccountInfo(account=address, ledger_index="validated"))
        return int(response.result['account_data']['Balance'])
    except:
        return 0

def get_account_nfts(address):
    try:
        response = client.request(AccountNFTs(account=address, ledger_index="validated"))
        nfts = response.result.get('account_nfts', [])
        for nft in nfts:
            uri = nft.get('URI')
            if uri:
                nft['URI_decoded'] = hex_to_str(uri)
        return nfts
    except Exception as e:
        print(f"Error getting NFTs: {e}")
        return []

def check_kyc_status(address, issuer_address):
    try:
        credential_type_hex = KYC_CREDENTIAL_TYPE.encode('utf-8').hex().upper()
        response = client.request(AccountObjects(
            account=issuer_address,
            type="credential",
            ledger_index="validated"
        ))
        credentials = response.result.get('account_objects', [])
        for cred in credentials:
            if cred.get('Subject') == address and cred.get('CredentialType') == credential_type_hex:
                flags = cred.get('Flags', 0)
                is_accepted = bool(flags & 0x00010000)
                return {"exists": True, "accepted": is_accepted, "whitelisted": is_accepted}
        return {"exists": False, "accepted": False, "whitelisted": False}
    except Exception as e:
        print(f"Error checking KYC: {e}")
        return {"exists": False, "accepted": False, "whitelisted": False, "error": str(e)}

def get_account_transactions(address, limit=20):
    try:
        response = client.request(AccountTx(account=address, limit=limit, ledger_index_min=-1, ledger_index_max=-1))
        return response.result.get('transactions', [])
    except Exception as e:
        print(f"Error getting transactions: {e}")
        return []

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "ok",
        "network": "XRPL Testnet",
        "last_sync": data_store["last_sync"]
    })

@app.route('/portfolio/<address>', methods=['GET'])
def portfolio(address):
    balance = get_account_balance(address)
    nfts = get_account_nfts(address)

    holdings = [{
        "asset_id": "XRP",
        "symbol": "XRP",
        "name": "XRP",
        "balance": str(balance / 1000000),
        "type": "native"
    }]

    for nft in nfts:
        uri_data = nft.get('URI_decoded', '{}')
        try:
            metadata = json.loads(uri_data)
            name = metadata.get('name', metadata.get('n', 'Unknown NFT'))
        except:
            name = 'Unknown NFT'

        holdings.append({
            "asset_id": nft['NFTokenID'],
            "symbol": "NFT",
            "name": name,
            "balance": "1",
            "type": "nft",
            "metadata": nft.get('URI_decoded')
        })

    return jsonify({"address": address, "holdings": holdings})

@app.route('/compliance/<address>', methods=['GET'])
def compliance(address):
    kyc_issuer = request.args.get('kyc_issuer')
    if not kyc_issuer:
        return jsonify({"kyc": False, "whitelisted": False, "blacklisted": False})

    kyc_status = check_kyc_status(address, kyc_issuer)
    return jsonify({
        "kyc": kyc_status.get("exists", False),
        "whitelisted": kyc_status.get("whitelisted", False),
        "blacklisted": False
    })

@app.route('/assets', methods=['GET'])
def assets():
    nft_issuer = request.args.get('issuer')
    if nft_issuer:
        nfts = get_account_nfts(nft_issuer)
        assets_list = []
        for nft in nfts:
            uri_data = nft.get('URI_decoded', '{}')
            try:
                metadata = json.loads(uri_data)
                name = metadata.get('name', metadata.get('n', 'Unknown NFT'))
            except:
                name = 'Unknown NFT'
            assets_list.append({
                "id": nft['NFTokenID'],
                "type": "nft",
                "name": name,
                "tokenAddress": nft['NFTokenID'],
                "description": f"CSGO Skin NFT on XRPL"
            })
        return jsonify(assets_list)
    return jsonify(data_store["assets"])

@app.route('/trades', methods=['GET'])
def trades():
    address = request.args.get('address')
    if address:
        txs = get_account_transactions(address, limit=10)
        formatted = []
        for tx in txs:
            tx_data = tx.get('tx', {})
            tx_type = tx_data.get('TransactionType', '')
            formatted.append({
                "id": tx_data.get('hash', ''),
                "assetIn": tx_type,
                "assetOut": "XRP",
                "amountIn": "1",
                "amountOut": "1",
                "timestamp": tx.get('close_time_iso', ''),
                "txHash": tx_data.get('hash', '')
            })
        return jsonify(formatted)
    return jsonify(data_store["trades"])

@app.route('/nfts/<address>', methods=['GET'])
def nfts(address):
    nfts = get_account_nfts(address)
    return jsonify(nfts)

@app.route('/account/<address>', methods=['GET'])
def account_info(address):
    balance = get_account_balance(address)
    nfts = get_account_nfts(address)
    return jsonify({
        "address": address,
        "balance_drops": balance,
        "balance_xrp": balance / 1000000,
        "nft_count": len(nfts)
    })

@app.route('/kyc/check', methods=['GET'])
def kyc_check():
    address = request.args.get('address')
    issuer = request.args.get('issuer')
    if not address or not issuer:
        return jsonify({"error": "address and issuer required"}), 400
    status = check_kyc_status(address, issuer)
    return jsonify(status)

@app.route('/oracle/<asset_id>', methods=['GET'])
def oracle(asset_id):
    prices = {
        "XRP": {"price": 0.52, "currency": "USD"},
        "CSG": {"price": 15.0, "currency": "USD"}
    }
    return jsonify(prices.get(asset_id, {"price": 10.0, "currency": "USD"}))

def sync_loop():
    while True:
        data_store["last_sync"] = time.strftime("%Y-%m-%d %H:%M:%S")
        time.sleep(60)

if __name__ == '__main__':
    sync_thread = threading.Thread(target=sync_loop, daemon=True)
    sync_thread.start()
    app.run(host='0.0.0.0', port=5000, debug=True)
