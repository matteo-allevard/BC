import { appConfig } from "../config/appConfig";
import { useApp } from "../context/AppContext";
import { StatusPill } from "./StatusPill";

export const NetworkGate = ({
  children,
  requireWhitelist = true
}: {
  children: React.ReactNode;
  requireWhitelist?: boolean;
}) => {
  const { wallet, compliance } = useApp();

  if (!wallet.connected) {
    return (
      <div className="gate">
        <StatusPill tone="warn" label="Wallet not connected" />
        <p>Connect a wallet to access on-chain actions.</p>
      </div>
    );
  }

  if (wallet.chainId !== appConfig.chain.chainId) {
    return (
      <div className="gate">
        <StatusPill tone="bad" label="Wrong network" />
        <p>Switch to {appConfig.chain.name} to continue.</p>
      </div>
    );
  }

  if (!compliance) {
    return (
      <div className="gate">
        <StatusPill tone="info" label="Loading compliance" />
        <p>Fetching whitelist and KYC status from the indexer.</p>
      </div>
    );
  }

  if (compliance?.blacklisted) {
    return (
      <div className="gate">
        <StatusPill tone="bad" label="Blacklisted" />
        <p>This wallet is blacklisted and cannot interact.</p>
      </div>
    );
  }

  if (requireWhitelist && !compliance?.whitelisted) {
    return (
      <div className="gate">
        <StatusPill tone="warn" label="Not whitelisted" />
        <p>Complete KYC to gain access to tokenized assets.</p>
      </div>
    );
  }

  return <>{children}</>;
};
