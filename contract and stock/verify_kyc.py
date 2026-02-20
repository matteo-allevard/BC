#!/usr/bin/env python
"""
Module de vérification KYC avec Credentials XRPL
"""

import xrpl
from binascii import hexlify
from config import KYC_CREDENTIAL_TYPE
from utils import get_client

def verify_user_kyc(subject_address, issuer_address):
    """
    Vérifie si un utilisateur possède un credential KYC valide
    
    :param subject_address: Adresse de l'utilisateur à vérifier
    :param issuer_address: Adresse de l'émetteur KYC
    :return: True si le credential est valide et accepté, False sinon
    """
    client = get_client()
    
    # Convertir le type de credential en hexadécimal
    credential_type_hex = hexlify(KYC_CREDENTIAL_TYPE.encode("utf-8")).decode("ascii").upper()
    
    # Méthode simple: utiliser account_objects pour lister les credentials de l'émetteur
    objects_request = xrpl.models.requests.AccountObjects(
        account=issuer_address,
        type="credential",
        ledger_index="validated"
    )
    
    try:
        print(f"🔍 Recherche de credentials pour {subject_address}...")
        response = client.request(objects_request)
        
        if response.is_successful():
            credentials = response.result.get('account_objects', [])
            print(f"📊 {len(credentials)} credentials trouvés au total")
            
            # Parcourir tous les credentials pour trouver celui qui correspond
            for cred in credentials:
                cred_subject = cred.get('Subject')
                cred_type = cred.get('CredentialType')
                
                if cred_subject == subject_address and cred_type == credential_type_hex:
                    print(f"✅ Credential trouvé pour {subject_address}")
                    
                    # Vérifier que le credential est accepté (Flags & lsfAccepted)
                    flags = cred.get('Flags', 0)
                    lsf_accepted = 0x00010000  # Flag pour accepted
                    
                    if flags & lsf_accepted:
                        print(f"✅ Credential accepté!")
                        return True
                    else:
                        print(f"⚠️ Credential trouvé mais non accepté")
                        return False
            
            print(f"❌ Aucun credential trouvé pour {subject_address}")
            return False
        else:
            print(f"❌ Erreur lors de la requête: {response}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification: {e}")
        return False

def is_whitelisted(address, issuer_address):
    """
    Vérifie si une adresse est whitelistée (possède un KYC valide)
    """
    return verify_user_kyc(address, issuer_address)

def is_blacklisted(address, issuer_address):
    """
    Vérifie si une adresse est blacklistée
    """
    return not verify_user_kyc(address, issuer_address)

def check_kyc_status(address, issuer_address):
    """
    Vérification détaillée du statut KYC
    Retourne un dictionnaire avec plus d'informations
    """
    client = get_client()
    credential_type_hex = hexlify(KYC_CREDENTIAL_TYPE.encode("utf-8")).decode("ascii").upper()
    
    objects_request = xrpl.models.requests.AccountObjects(
        account=issuer_address,
        type="credential",
        ledger_index="validated"
    )
    
    try:
        response = client.request(objects_request)
        
        if response.is_successful():
            credentials = response.result.get('account_objects', [])
            
            for cred in credentials:
                if (cred.get('Subject') == address and 
                    cred.get('CredentialType') == credential_type_hex):
                    
                    flags = cred.get('Flags', 0)
                    lsf_accepted = 0x00010000
                    
                    return {
                        'exists': True,
                        'accepted': bool(flags & lsf_accepted),
                        'flags': flags,
                        'expiration': cred.get('Expiration'),
                        'issuer': cred.get('Issuer'),
                        'subject': cred.get('Subject'),
                        'credential_type': cred.get('CredentialType')
                    }
            
            return {'exists': False, 'accepted': False, 'reason': 'No credential found'}
        else:
            return {'exists': False, 'accepted': False, 'error': str(response)}
            
    except Exception as e:
        return {'exists': False, 'accepted': False, 'error': str(e)}