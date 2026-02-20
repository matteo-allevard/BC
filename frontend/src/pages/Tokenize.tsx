import { SectionHeader } from "../components/SectionHeader";
import { NetworkGate } from "../components/NetworkGate";
import { appConfig } from "../config/appConfig";

export const Tokenize = () => {
  return (
    <div className="page">
      <SectionHeader
        title="Tokenize"
        subtitle="Create NFTs for real-world assets on XRPL."
      />

      <NetworkGate>
        <div className="grid grid--two">
          <div className="card">
            <h3>XRPL NFT Minting</h3>
            <p>
              NFT minting on XRPL is done through the Python backend.
              Run the main.py script to mint CSGO skin NFTs.
            </p>
            <div className="notice" style={{ marginTop: "16px" }}>
              <code>cd "contract and stock" && python main.py</code>
            </div>
          </div>

          <div className="card">
            <h3>What gets created</h3>
            <ul style={{ marginLeft: "20px", marginTop: "12px", lineHeight: "1.8" }}>
              <li>KYC credentials for users</li>
              <li>NFTs representing CSGO skins</li>
              <li>Liquidity pools for trading</li>
            </ul>
            <div style={{ marginTop: "16px" }}>
              <a
                href={appConfig.chain.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                View on XRPL Explorer
              </a>
            </div>
          </div>
        </div>
      </NetworkGate>
    </div>
  );
};
