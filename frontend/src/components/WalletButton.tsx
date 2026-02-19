import { appConfig } from "../config/appConfig";
import { useApp } from "../context/AppContext";
import { StatusPill } from "./StatusPill";
import { switchChain } from "../services/wallet";

export const WalletButton = () => {
  const { wallet, connect } = useApp();

  if (!wallet.connected) {
    return (
      <button className="btn btn--primary" onClick={connect}>
        Connect wallet
      </button>
    );
  }

  const isWrongNetwork =
    wallet.chainId && wallet.chainId !== appConfig.chain.chainId;

  return (
    <div className="wallet">
      {isWrongNetwork && (
        <button
          className="btn btn--ghost"
          onClick={() => switchChain(appConfig.chain.chainId)}
        >
          Switch network
        </button>
      )}
      {!isWrongNetwork && (
        <StatusPill tone="good" label="Connected" />
      )}
      <div className="wallet__info">
        <span className="wallet__label">{appConfig.chain.name}</span>
        <span className="wallet__address">
          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
        </span>
      </div>
    </div>
  );
};
