import { useState } from "react";
import { appConfig } from "../config/appConfig";
import { useApp } from "../context/AppContext";
import { StatusPill } from "./StatusPill";

export const WalletButton = () => {
  const { wallet, connect, disconnect } = useApp();
  const [inputAddress, setInputAddress] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleConnect = async () => {
    if (inputAddress.trim()) {
      await connect(inputAddress.trim());
      setShowInput(false);
      setInputAddress("");
    }
  };

  if (!wallet.connected) {
    if (showInput) {
      return (
        <div className="wallet-connect">
          <input
            type="text"
            placeholder="Enter XRPL address (r...)"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            className="wallet-input"
          />
          <button className="btn btn--primary" onClick={handleConnect}>
            Connect
          </button>
          <button className="btn btn--ghost" onClick={() => setShowInput(false)}>
            Cancel
          </button>
        </div>
      );
    }

    return (
      <button className="btn btn--primary" onClick={() => setShowInput(true)}>
        Connect wallet
      </button>
    );
  }

  return (
    <div className="wallet">
      <StatusPill tone="good" label="Connected" />
      <div className="wallet__info">
        <span className="wallet__label">{appConfig.chain.name}</span>
        <span className="wallet__address">
          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
        </span>
      </div>
      <button className="btn btn--ghost btn--sm" onClick={disconnect}>
        Disconnect
      </button>
    </div>
  );
};
