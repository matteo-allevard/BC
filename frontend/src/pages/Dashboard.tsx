import { useMemo } from "react";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { AssetCard } from "../components/AssetCard";
import { TradeCard } from "../components/TradeCard";
import { KycPanel } from "../components/KycPanel";
import { OracleCard } from "../components/OracleCard";
import { useApp } from "../context/AppContext";
import { EmptyState } from "../components/EmptyState";

export const Dashboard = () => {
  const { assets, portfolio, trades, compliance, oraclePrices, indexerStatus } = useApp();

  const latestOracle = useMemo(() => Object.values(oraclePrices), [oraclePrices]);

  return (
    <div className="page">
      <SectionHeader
        title="Portfolio Snapshot"
        subtitle="Live on-chain balances, oracle updates, and compliance checks."
      />

      <div className="grid grid--metrics">
        <MetricCard label="Assets tracked" value={`${assets.length}`} hint="Fungible + NFT" />
        <MetricCard label="Holdings" value={`${portfolio.length}`} hint="On-chain balances" />
        <MetricCard
          label="Indexer sync"
          value={indexerStatus ? "Healthy" : "Offline"}
          hint={indexerStatus ? `Lag ${indexerStatus.lagSeconds}s` : "Check indexer API"}
        />
        <MetricCard label="Compliance" value={compliance?.whitelisted ? "Whitelisted" : "Restricted"} />
      </div>

      <div className="grid grid--two">
        <KycPanel compliance={compliance} />
        <div className="card sync-card">
          <h3>Indexer heartbeat</h3>
          <p>
            The frontend polls every minute. If a trade happens outside this UI,
            the portfolio updates automatically.
          </p>
          <div className="sync-card__meta">
            <div>
              <div className="muted">Last synced</div>
              <strong>
                {indexerStatus?.lastSynced
                  ? new Date(indexerStatus.lastSynced).toLocaleString()
                  : "-"}
              </strong>
            </div>
            <div>
              <div className="muted">Chain</div>
              <strong>{indexerStatus?.chainId ?? "-"}</strong>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Oracle feeds" subtitle="Prix temps réel depuis CoinGecko et Steam Market." />
      <div className="grid grid--two">
        {latestOracle.length === 0 ? (
          <EmptyState title="Chargement des prix..." subtitle="L'indexer récupère les prix en temps réel." />
        ) : (
          latestOracle.map((oracle) => <OracleCard key={oracle.assetId} oracle={oracle} />)
        )}
      </div>

      <SectionHeader title="Your holdings" subtitle="Balances synced from the indexer." />
      <div className="grid grid--three">
        {portfolio.length === 0 ? (
          <EmptyState title="No holdings yet" subtitle="Holdings appear after minting or swaps." />
        ) : (
          portfolio.map((holding) => {
            const asset = assets.find((item) => item.id === holding.assetId);
            const isXrp = holding.assetId === "XRP";
            const xrpOracle = oraclePrices["XRP"];
            const usdValue = isXrp && xrpOracle
              ? (parseFloat(holding.balance) * parseFloat(xrpOracle.price.replace("$", ""))).toFixed(2)
              : null;
            return (
              <div key={holding.assetId} className="card holding-card">
                <div className="holding-card__title">{asset?.name ?? holding.assetId}</div>
                <div className="holding-card__value">{holding.balance} {isXrp ? "XRP" : ""}</div>
                {usdValue ? (
                  <div className="muted">≈ <strong>${usdValue}</strong> USD · via {xrpOracle.source}</div>
                ) : (
                  <div className="muted">Valuation {holding.valuation ?? "-"}</div>
                )}
              </div>
            );
          })
        )}
      </div>

      <SectionHeader title="Recent trades" subtitle="Live DEX activity across the pool." />
      <div className="stack">
        {trades.length === 0 ? (
          <EmptyState title="No trades yet" subtitle="Trades will appear once swaps occur." />
        ) : (
          trades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
        )}
      </div>

      <SectionHeader title="Tracked assets" subtitle="Tokenized RWAs on-chain." />
      <div className="grid grid--three">
        {assets.length === 0 ? (
          <EmptyState title="No assets yet" subtitle="Use the Tokenize tab to mint the first asset." />
        ) : (
          assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} oraclePrice={oraclePrices[asset.id]} />
          ))
        )}
      </div>
    </div>
  );
};
