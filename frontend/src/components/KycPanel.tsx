import { appConfig } from "../config/appConfig";
import type { ComplianceStatus } from "../types";
import { StatusPill } from "./StatusPill";

export const KycPanel = ({ compliance }: { compliance?: ComplianceStatus }) => (
  <div className="card kyc-panel">
    <div className="kyc-panel__row">
      <div>
        <h3>KYC & Compliance</h3>
        <p>On-chain whitelist and blacklist status are enforced by the smart contract.</p>
      </div>
      <StatusPill
        tone={
          compliance?.kycStatus === "approved"
            ? "good"
            : compliance?.kycStatus === "pending"
            ? "warn"
            : compliance?.kycStatus === "rejected"
            ? "bad"
            : "info"
        }
        label={compliance?.kycStatus ?? "unknown"}
      />
    </div>
    <div className="kyc-panel__grid">
      <div>
        <div className="muted">Whitelist</div>
        <strong>{compliance?.whitelisted ? "Active" : "Inactive"}</strong>
      </div>
      <div>
        <div className="muted">Blacklist</div>
        <strong>{compliance?.blacklisted ? "Yes" : "No"}</strong>
      </div>
      <div>
        <div className="muted">Last update</div>
        <strong>{compliance?.lastUpdated ? new Date(compliance.lastUpdated).toLocaleString() : "-"}</strong>
      </div>
    </div>
    <a className="btn btn--ghost" href={appConfig.compliance.kycUrl} target="_blank" rel="noreferrer">
      Open KYC portal
    </a>
  </div>
);
