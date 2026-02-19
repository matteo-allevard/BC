import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { SectionHeader } from "../components/SectionHeader";
import { useApp } from "../context/AppContext";
import { EmptyState } from "../components/EmptyState";
import { NetworkGate } from "../components/NetworkGate";
import { OracleCard } from "../components/OracleCard";

export const AssetDetail = () => {
  const { assetId } = useParams();
  const { assets, portfolio, oraclePrices } = useApp();

  const asset = useMemo(() => assets.find((item) => item.id === assetId), [assets, assetId]);
  const holding = useMemo(
    () => portfolio.find((item) => item.assetId === assetId),
    [portfolio, assetId]
  );

  if (!asset) {
    return (
      <div className="page">
        <EmptyState title="Asset not found" subtitle="Check the asset list or refresh indexer." />
      </div>
    );
  }

  const oracle = oraclePrices[asset.id];

  return (
    <div className="page">
      <SectionHeader title={asset.name} subtitle={asset.description} />

      <div className="grid grid--two">
        <div className="card detail-card">
          <div className="detail-card__row">
            <div className="muted">Type</div>
            <strong>{asset.type.toUpperCase()}</strong>
          </div>
          <div className="detail-card__row">
            <div className="muted">Symbol</div>
            <strong>{asset.symbol ?? "-"}</strong>
          </div>
          <div className="detail-card__row">
            <div className="muted">Supply</div>
            <strong>{asset.supply ?? "-"}</strong>
          </div>
          <div className="detail-card__row">
            <div className="muted">Decimals</div>
            <strong>{asset.decimals ?? "-"}</strong>
          </div>
          <div className="detail-card__row">
            <div className="muted">Token address</div>
            <strong>{asset.tokenAddress}</strong>
          </div>
        </div>

        <div className="card detail-card">
          <h3>Your holding</h3>
          <p className="detail-card__value">{holding?.balance ?? "0"}</p>
          <p className="muted">Valuation: {holding?.valuation ?? "-"}</p>
          <NetworkGate>
            <div className="detail-card__actions">
              <button className="btn btn--ghost">Transfer</button>
              <button className="btn btn--primary">Trade</button>
            </div>
          </NetworkGate>
        </div>
      </div>

      {oracle && (
        <div className="grid grid--two">
          <OracleCard oracle={oracle} />
        </div>
      )}
    </div>
  );
};
