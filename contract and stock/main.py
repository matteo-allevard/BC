#!/usr/bin/env python
import json
from account import create_testnet_account, get_account_from_seed
from nft_skins import CSGOSkinNFT
from credential_kyc import KYCManager
from verify_kyc import verify_user_kyc, is_whitelisted, check_kyc_status
from amm_liquidity import LiquidityPool
from token_fungible import FungibleToken

CURRENCY_CODE = "CSG"  # 3 caractères pour XRPL

def demo_complete_flow():
    print("="*60)
    print("DEMO - Tokenisation CSGO sur XRPL")
    print("="*60)

    # ETAPE 1: Création des comptes
    print("\n[1] Création des comptes")
    print("-"*40)
    kyc_issuer = create_testnet_account()
    token_issuer = create_testnet_account()
    player = create_testnet_account()
    trader = create_testnet_account()

    # ETAPE 2: Setup KYC
    print("\n[2] Setup KYC")
    print("-"*40)
    kyc_manager = KYCManager(kyc_issuer.seed)
    kyc_manager.issue_kyc_credential(player.classic_address)
    kyc_manager.issue_kyc_credential(trader.classic_address)

    # ETAPE 3: Mint NFT skin
    print("\n[3] Mint NFT Skin")
    print("-"*40)
    skin_manager = CSGOSkinNFT(token_issuer.seed)
    skin_data = {
        "weapon": "AK-47",
        "skin": "Redline",
        "condition": "Field-Tested",
        "float": 0.287,
        "pattern": 321
    }
    result, token_id = skin_manager.mint_skin(
        skin_name="AK-47 | Redline (FT)",
        skin_data=skin_data,
        flags=8,
        transfer_fee=500
    )

    # ETAPE 4: Création token fungible + pool AMM
    print("\n[4] Création token fungible CSG")
    print("-"*40)
    token_manager = FungibleToken(token_issuer.seed)
    token_manager.setup_issuer()

    # Créer trustline pour le trader (celui qui va fournir la liquidité)
    print("\n[5] Setup trustlines")
    print("-"*40)
    token_manager.create_trustline(trader.seed, CURRENCY_CODE)
    token_manager.send_tokens(trader.classic_address, CURRENCY_CODE, "1000")

    # ETAPE 5: Création du pool AMM
    print("\n[6] Création pool AMM CSG/XRP")
    print("-"*40)
    pool_manager = LiquidityPool(trader.seed)
    pool_manager.create_pool(
        token_currency=CURRENCY_CODE,
        token_issuer=token_issuer.classic_address,
        token_amount="500",
        xrp_amount="25000000",  # 25 XRP
        trading_fee=500  # 0.5%
    )

    # ETAPE 6: Faire un swap
    print("\n[7] Test swap XRP -> CSG")
    print("-"*40)
    pool_manager.swap_xrp_for_token(
        token_currency=CURRENCY_CODE,
        token_issuer=token_issuer.classic_address,
        xrp_amount_drops="5000000"  # 5 XRP
    )

    # ETAPE 7: Vérifier le pool
    print("\n[8] Info du pool AMM")
    print("-"*40)
    amm_info = pool_manager.get_amm_info(CURRENCY_CODE, token_issuer.classic_address)
    if amm_info:
        print(f"Pool trouvé: {json.dumps(amm_info.get('amm', {}), indent=2)[:500]}")

    # ETAPE 8: Vérification KYC
    print("\n[9] Vérification KYC")
    print("-"*40)
    status = check_kyc_status(player.classic_address, kyc_issuer.classic_address)
    print(f"Statut KYC joueur: {status}")

    # Résumé
    print("\n" + "="*60)
    print("DEMO TERMINEE")
    print("="*60)
    print("\nRESUME DES COMPTES:")
    print("-"*40)
    print(f"KYC Issuer:    {kyc_issuer.classic_address}")
    print(f"  Seed: {kyc_issuer.seed}")
    print(f"Token Issuer:  {token_issuer.classic_address}")
    print(f"  Seed: {token_issuer.seed}")
    print(f"Player:        {player.classic_address}")
    print(f"  Seed: {player.seed}")
    print(f"Trader (LP):   {trader.classic_address}")
    print(f"  Seed: {trader.seed}")
    print(f"\nToken: {CURRENCY_CODE}")
    print(f"Pool: {CURRENCY_CODE}/XRP")

if __name__ == "__main__":
    demo_complete_flow()
