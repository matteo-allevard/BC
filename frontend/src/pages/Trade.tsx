import { SectionHeader } from "../components/SectionHeader";
import { NetworkGate } from "../components/NetworkGate";
import { appConfig } from "../config/appConfig";

export const Trade = () => {
  return (
    <div className="page">
      <SectionHeader
        title="Trade"
        subtitle="Trade assets through the XRPL AMM."
      />
      <NetworkGate>
        <div className="grid grid--two">
          <div className="card">
            <h3>XRPL AMM Trading</h3>
            <p>
              Trading on XRPL is done through the native AMM.
              Use the XRPL testnet explorer to interact with the AMM directly.
            </p>
            <div style={{ marginTop: "16px" }}>
              <a
                href={appConfig.chain.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                Open XRPL Explorer
              </a>
            </div>
          </div>
          <div className="card">
            <h3>How it works</h3>
            <ul style={{ marginLeft: "20px", marginTop: "12px", lineHeight: "1.8" }}>
              <li>Assets are traded on the XRPL native AMM</li>
              <li>Only whitelisted users can trade</li>
              <li>Trades are reflected in the portfolio via the indexer</li>
              <li>The indexer syncs every 60 seconds</li>
            </ul>
          </div>
        </div>
      </NetworkGate>
    </div>
  );
};
