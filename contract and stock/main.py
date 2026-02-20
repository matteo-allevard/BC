#!/usr/bin/env python
"""
Démonstration du système de tokenisation de skins CSGO sur XRPL
"""

import json
from account import create_testnet_account, get_account_from_seed
from nft_skins import CSGOSkinNFT
from credential_kyc import KYCManager
from verify_kyc import verify_user_kyc, is_whitelisted
from amm_liquidity import LiquidityPool

def demo_complete_flow():
    """
    Démonstration complète du workflow:
    1. Création des comptes
    2. Émission KYC
    3. Mint de skins CSGO
    4. Vérification
    5. Création de pool de liquidité
    """
    
    print("="*60)
    print("🎮 DÉMONSTRATION - Tokenisation Skins CSGO sur XRPL")
    print("="*60)
    
    # ÉTAPE 1: Création des comptes de test
    print("\n📝 ÉTAPE 1: Création des comptes")
    print("-"*40)
    
    # Compte pour l'émetteur KYC
    kyc_issuer = create_testnet_account()
    
    # Compte pour l'émetteur des skins
    skin_issuer = create_testnet_account()
    
    # Compte pour un utilisateur (joueur)
    player = create_testnet_account()
    
    # ÉTAPE 2: Initialisation des gestionnaires
    print("\n🔧 ÉTAPE 2: Initialisation des composants")
    print("-"*40)
    
    kyc_manager = KYCManager(kyc_issuer.seed)
    skin_manager = CSGOSkinNFT(skin_issuer.seed)
    
    # ÉTAPE 3: Émission du KYC pour le joueur
    print("\n🔐 ÉTAPE 3: Émission du credential KYC")
    print("-"*40)
    
    kyc_result = kyc_manager.issue_kyc_credential(player.classic_address)
    if kyc_result:
        print("✅ Credential KYC émis avec succès!")
    
    # Note: Dans un cas réel, le joueur devrait accepter le credential
    # via une transaction CredentialAccept
    
    # ÉTAPE 4: Mint d'un skin CSGO
    print("\n🎨 ÉTAPE 4: Mint d'un skin CSGO")
    print("-"*40)
    
    # Données du skin
    skin_data = {
        "weapon": "AK-47",
        "skin": "Redline",
        "condition": "Field-Tested",
        "float": 0.287,
        "pattern": 321,
        "stattrak": False,
        "souvenir": False
    }
    
    result, token_id = skin_manager.mint_skin(
        skin_name="AK-47 | Redline (Field-Tested)",
        skin_data=skin_data,
        flags=8,  # Transferable
        transfer_fee=500  # 5% royalties
    )
    
    if token_id:
        print(f"\n✅ Skin minté avec Token ID: {token_id}")

    # Après l'émission du credential
    print("\n🔍 Vérification immédiate du KYC...")
    from verify_kyc import check_kyc_status
    status = check_kyc_status(player.classic_address, kyc_issuer.classic_address)
    print(f"Statut KYC détaillé: {status}")
    
    # ÉTAPE 5: Vérification du KYC
    print("\n✅ ÉTAPE 5: Vérification KYC")
    print("-"*40)
    
    if is_whitelisted(player.classic_address, kyc_issuer.classic_address):
        print("✅ Le joueur est whitelisté!")
    else:
        print("⚠️ Le joueur n'est pas encore whitelisté (acceptation du credential requise)")
    
    # ÉTAPE 6: Récupération des skins possédés
    print("\n📦 ÉTAPE 6: Liste des skins de l'émetteur")
    print("-"*40)
    
    skins = skin_manager.get_owned_skins()
    for skin in skins:
        print(f"  • Token ID: {skin['NFTokenID']}")
        if 'URI_decoded' in skin:
            print(f"    Metadata: {skin['URI_decoded'][:100]}...")
    
    print("\n" + "="*60)
    print("🎉 Démonstration terminée!")
    print("="*60)
    
    # Résumé des comptes
    print("\n📋 RÉSUMÉ DES COMPTES")
    print("-"*40)
    print(f"🔐 Émetteur KYC:  {kyc_issuer.classic_address}")
    print(f"   Seed: {kyc_issuer.seed}")
    print(f"🎮 Émetteur Skins: {skin_issuer.classic_address}")
    print(f"   Seed: {skin_issuer.seed}")
    print(f"👤 Joueur:         {player.classic_address}")
    print(f"   Seed: {player.seed}")

if __name__ == "__main__":
    demo_complete_flow()