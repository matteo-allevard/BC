import { Link } from "react-router-dom";
import type { Asset, OraclePrice } from "../types";
import { StatusPill } from "./StatusPill";

export const AssetCard = ({
  asset,
  oraclePrice
}: {
  asset: Asset;
  oraclePrice?: OraclePrice;
}) => (
  <Link to={`/assets/${asset.id}`} className="card asset-card">
    <div className="asset-card__top">
      <div>
        <div className="asset-card__title">{asset.name}</div>
        <div className="asset-card__subtitle">
          {asset.type === "fungible"
            ? `${asset.symbol ?? "TOKEN"} / ${asset.supply ?? ""}`
            : "Unique NFT"}
        </div>
      </div>
      <StatusPill
        tone={asset.type === "fungible" ? "info" : "warn"}
        label={asset.type.toUpperCase()}
      />
    </div>
    <p className="asset-card__description">{asset.description}</p>
    {oraclePrice && (
      <div className="asset-card__oracle">
        <span>Oracle</span>
        <strong>{oraclePrice.price}</strong>
        <span className="muted">Updated {new Date(oraclePrice.updatedAt).toLocaleTimeString()}</span>
      </div>
    )}
    <div className="asset-card__meta">
      <span className="muted">{asset.tokenAddress}</span>
    </div>
  </Link>
);
