import type { OraclePrice } from "../types";

const LABELS: Record<string, string> = {
  "XRP": "XRP / USD",
  "AK47-REDLINE": "AK-47 | Redline (FT)",
};

const SOURCE_BADGE: Record<string, string> = {
  "CoinGecko": "🟡",
  "Steam Market": "🟢",
  "fallback": "⚪",
  "platform": "🔵",
};

export const OracleCard = ({ oracle }: { oracle: OraclePrice }) => {
  const label = LABELS[oracle.assetId] ?? oracle.assetId;
  const badge = SOURCE_BADGE[oracle.source] ?? "⚪";

  return (
    <div className="card oracle-card">
      <div className="oracle-card__header">
        <span className="oracle-card__label">{label}</span>
        <span className="oracle-card__source" title={oracle.source}>{badge} {oracle.source}</span>
      </div>
      <div className="oracle-card__value">{oracle.price}</div>
      <div className="oracle-card__meta">
        {oracle.volume && <span>Volume: {oracle.volume} &nbsp;·&nbsp;</span>}
        <span>Mis à jour {new Date(oracle.updatedAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
