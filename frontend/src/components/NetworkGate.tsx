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
