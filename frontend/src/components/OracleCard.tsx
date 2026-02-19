import type { OraclePrice } from "../types";

export const OracleCard = ({
  oracle
}: {
  oracle: OraclePrice;
}) => (
  <div className="card oracle-card">
    <div className="oracle-card__title">Oracle: {oracle.assetId}</div>
    <div className="oracle-card__value">{oracle.price}</div>
    <div className="oracle-card__meta">
      Updated {new Date(oracle.updatedAt).toLocaleTimeString()} via {oracle.source}
    </div>
  </div>
);
