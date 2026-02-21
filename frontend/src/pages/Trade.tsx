import { useEffect, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { appConfig } from "../config/appConfig";

type PoolInfo = {
  xrp_balance: string;
  csg_balance: string;
  trading_fee: string;
  lp_token: string;
  account: string;
} | null;

export const Trade = () => {
  const [pool, setPool] = useState<PoolInfo>(null);

  useEffect(() => {
    fetch(`${appConfig.indexer.baseUrl}/amm/info`)
      .then((r) => r.json())
      .then((d) => setPool(d))
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <SectionHeader
        title="Trade"
        subtitle="Trading via l'AMM natif du XRP Ledger."
      />

      <div className="grid grid--two">
        <div className="card">
          <h3>Pool AMM CSG/XRP</h3>
          {pool ? (
            <div style={{ marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="muted">XRP dans le pool</span>
                <strong>{pool.xrp_balance} XRP</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="muted">CSG dans le pool</span>
                <strong>{pool.csg_balance} CSG</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="muted">Frais de trading</span>
                <strong>{pool.trading_fee}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span className="muted">Compte AMM</span>
                <strong style={{ fontSize: "11px" }}>{pool.account}</strong>
              </div>
            </div>
          ) : (
            <p style={{ marginTop: "12px" }} className="muted">Chargement des données du pool...</p>
          )}
          <div style={{ marginTop: "16px" }}>
            <a
              href={appConfig.chain.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Voir le pool sur XRPL Explorer
            </a>
          </div>
        </div>

        <div className="card">
          <h3>Comment trader</h3>
          <ul style={{ marginLeft: "20px", marginTop: "12px", lineHeight: "2" }}>
            <li>Seuls les utilisateurs <strong>whitelistés</strong> peuvent trader</li>
            <li>Les swaps passent par l'<strong>AMM natif XRPL</strong></li>
            <li>Le prix est calculé automatiquement: <code>x × y = k</code></li>
            <li>L'indexer détecte les trades extérieurs toutes les <strong>60s</strong></li>
          </ul>
          <div className="notice" style={{ marginTop: "16px" }}>
            <strong>Faire un swap via le script:</strong>
            <br />
            <code>python amm_liquidity.py</code>
          </div>
        </div>
      </div>
    </div>
  );
};
