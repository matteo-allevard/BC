from flask import Flask, jsonify, request
from flask_cors import CORS
import xrpl
from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountNFTs, AccountInfo, AccountObjects, AccountTx
import threading
import time
import json
import requests as http_requests
from urllib.parse import quote

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

import os
AMM_ISSUER = os.environ.get("TOKEN_ISSUER", "rKkKWpDhk7p8f5HKSjAYAuaoyanYeJJrEo")
AMM_CURRENCY = "CSG"

@app.route('/amm/info', methods=['GET'])
def amm_info():
    try:
        amm_request = xrpl.models.requests.AMMInfo(
            asset=xrpl.models.currencies.XRP(),
            asset2=xrpl.models.currencies.IssuedCurrency(
                currency=AMM_CURRENCY,
                issuer=AMM_ISSUER
            )
        )
        response = client.request(amm_request)
        amm = response.result.get("amm", {})
        xrp_drops = int(amm.get("amount", 0))
        csg = amm.get("amount2", {})
        fee = amm.get("trading_fee", 0)
        return jsonify({
            "xrp_balance": f"{xrp_drops / 1_000_000:.4f}",
            "csg_balance": csg.get("value", "0"),
            "trading_fee": f"{fee / 1000:.1%}",
            "account": amm.get("account", ""),
            "lp_token": amm.get("lp_token", {}).get("value", "0")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/kyc/check', methods=['GET'])
def kyc_check():
    address = request.args.get('address')
    issuer = request.args.get('issuer')
    if not address or not issuer:
        return jsonify({"error": "address and issuer required"}), 400
    status = check_kyc_status(address, issuer)
    return jsonify(status)

oracle_cache = {}
ORACLE_TTL = 300  # 5 minutes

SKIN_NAMES = {
    "AK47-REDLINE": "AK-47 | Redline (Field-Tested)",
    "AK-47-REDLINE": "AK-47 | Redline (Field-Tested)",
    "REDLINE": "AK-47 | Redline (Field-Tested)",
}

def fetch_xrp_price():
    cache = oracle_cache.get("XRP")
    if cache and time.time() - cache["ts"] < ORACLE_TTL:
        return cache["data"]
    try:
        resp = http_requests.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
            timeout=5
        )
        price = resp.json()["ripple"]["usd"]
        data = {"price": price, "currency": "USD", "source": "CoinGecko"}
        oracle_cache["XRP"] = {"data": data, "ts": time.time()}
        return data
    except Exception as e:
        print(f"Oracle XRP error: {e}")
        return {"price": 0.52, "currency": "USD", "source": "fallback"}

def fetch_skin_price(market_hash_name):
    cache_key = market_hash_name
    cache = oracle_cache.get(cache_key)
    if cache and time.time() - cache["ts"] < ORACLE_TTL:
        return cache["data"]
    try:
        encoded = quote(market_hash_name)
        url = f"https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name={encoded}"
        resp = http_requests.get(url, timeout=5)
        result = resp.json()
        if result.get("success"):
            raw = result.get("median_price") or result.get("lowest_price", "0")
            price = float(raw.replace("$", "").replace(",", ".").strip())
            data = {
                "price": price,
                "currency": "USD",
                "source": "Steam Market",
                "volume": result.get("volume", "n/a"),
                "asset": market_hash_name
            }
            oracle_cache[cache_key] = {"data": data, "ts": time.time()}
            return data
    except Exception as e:
        print(f"Oracle Steam error: {e}")
    return {"price": 12.5, "currency": "USD", "source": "fallback", "asset": market_hash_name}

@app.route('/oracle/<asset_id>', methods=['GET'])
def oracle(asset_id):
    asset_upper = asset_id.upper()
    if asset_upper == "XRP":
        return jsonify(fetch_xrp_price())
    if asset_upper in ("CSG", "CSGO"):
        return jsonify({"price": 1.0, "currency": "USD", "source": "platform"})
    skin_name = SKIN_NAMES.get(asset_upper)
    if skin_name:
        return jsonify(fetch_skin_price(skin_name))
    # Essai direct avec le nom passé en paramètre (ex: "AK-47 | Redline (Field-Tested)")
    return jsonify(fetch_skin_price(asset_id))

def sync_loop():
    while True:
        data_store["last_sync"] = time.strftime("%Y-%m-%d %H:%M:%S")
        time.sleep(60)

if __name__ == '__main__':
    sync_thread = threading.Thread(target=sync_loop, daemon=True)
    sync_thread.start()
    app.run(host='0.0.0.0', port=5000, debug=True)
