import { SectionHeader } from "../components/SectionHeader";
import { NetworkGate } from "../components/NetworkGate";
import { appConfig } from "../config/appConfig";

export const Admin = () => {
  return (
    <div className="page">
      <SectionHeader
        title="Admin & Compliance"
        subtitle="KYC and whitelist management through XRPL credentials."
      />

      <NetworkGate requireWhitelist={false}>
        <div className="grid grid--two">
          <div className="card">
            <h3>KYC Management</h3>
            <p>
              KYC credentials are managed through the Python backend using XRPL Credentials.
            </p>
            <div className="notice" style={{ marginTop: "16px" }}>
              <strong>Issue KYC:</strong>
              <br />
              <code>kyc_manager.issue_kyc_credential(user_address)</code>
            </div>
            <div className="notice" style={{ marginTop: "12px" }}>
              <strong>Revoke KYC (Blacklist):</strong>
              <br />
              <code>kyc_manager.revoke_kyc_credential(user_address)</code>
            </div>
          </div>

          <div className="card">
            <h3>How XRPL KYC Works</h3>
            <ul style={{ marginLeft: "20px", marginTop: "12px", lineHeight: "1.8" }}>
              <li>KYC issuer creates a credential for the user</li>
              <li>User accepts the credential on-chain</li>
              <li>Accepted credential = Whitelisted</li>
              <li>Deleted credential = Blacklisted</li>
            </ul>
            <div style={{ marginTop: "16px" }}>
              <a
                href={appConfig.chain.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                View Credentials on Explorer
              </a>
            </div>
          </div>
        </div>
      </NetworkGate>
    </div>
  );
};
