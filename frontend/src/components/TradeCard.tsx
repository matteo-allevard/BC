import type { Trade } from "../types";

export const TradeCard = ({ trade }: { trade: Trade }) => (
  <div className="card trade-card">
    <div className="trade-card__row">
      <div>
        <div className="trade-card__title">
          {trade.assetIn} {"→"} {trade.assetOut}
        </div>
        <div className="trade-card__meta">
          {trade.amountIn} {"→"} {trade.amountOut}
        </div>
      </div>
      <div className="trade-card__meta">
        {new Date(trade.timestamp).toLocaleString()}
      </div>
    </div>
    <div className="trade-card__row">
      <span className="muted">Impact {trade.priceImpact ?? "n/a"}</span>
      {trade.txHash && <span className="muted">Tx {trade.txHash.slice(0, 8)}...</span>}
    </div>
  </div>
);
