import { SectionHeader } from "../components/SectionHeader";
import { appConfig } from "../config/appConfig";

export const Tokenize = () => {
  return (
    <div className="page">
      <SectionHeader
        title="Tokenize"
        subtitle="Création de NFTs et tokens fungibles pour des actifs réels sur XRPL."
      />

      <div className="grid grid--two">
        <div className="card">
          <h3>NFT Minting (XLS-20)</h3>
          <p style={{ marginTop: "8px", marginBottom: "16px" }}>
            Chaque skin CSGO est minté comme un NFT unique sur XRPL via le script Python.
            Le NFT contient les métadonnées du skin (nom, catégorie, condition).
          </p>
          <div className="notice">
            <strong>Lancer le script de démo:</strong>
            <br />
            <code>cd "contract and stock" && python main.py</code>
          </div>
          <div className="notice" style={{ marginTop: "12px" }}>
            <strong>Ce qui est créé:</strong>
            <ul style={{ marginLeft: "16px", marginTop: "6px", lineHeight: "1.8" }}>
              <li>Comptes KYC Issuer, Token Issuer, Player, Trader</li>
              <li>Credentials KYC pour les utilisateurs</li>
              <li>NFT AK-47 | Redline (Field-Tested)</li>
              <li>Token fungible CSG</li>
              <li>Pool AMM CSG/XRP</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h3>Standard XRPL XLS-20</h3>
          <p style={{ marginTop: "8px", marginBottom: "16px" }}>
            Les NFTs XRPL (XLS-20) sont natifs au protocole — pas de smart contract nécessaire.
            Chaque NFT a un ID unique, un émetteur, et un URI encodé en hexadécimal.
          </p>
          <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
            <li><strong>NFTokenID:</strong> identifiant unique 256 bits</li>
            <li><strong>URI:</strong> métadonnées JSON encodées en hex</li>
            <li><strong>Taxon:</strong> numéro de collection (1337 pour nos skins)</li>
            <li><strong>TransferFee:</strong> royalties automatiques</li>
          </ul>
          <div style={{ marginTop: "16px" }}>
            <a
              href={appConfig.chain.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost"
            >
              Voir sur XRPL Explorer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
