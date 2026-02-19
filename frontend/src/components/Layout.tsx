import { NavLink } from "react-router-dom";
import { WalletButton } from "./WalletButton";
import { useApp } from "../context/AppContext";
import { StatusPill } from "./StatusPill";
import { appConfig } from "../config/appConfig";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { compliance } = useApp();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">TAM</span>
          <div>
            <div className="brand__title">Tokenized Asset</div>
            <div className="brand__subtitle">Management Lab</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className="nav__link">
            Dashboard
          </NavLink>
          <NavLink to="/assets" className="nav__link">
            Assets
          </NavLink>
          <NavLink to="/tokenize" className="nav__link">
            Tokenize
          </NavLink>
          <NavLink to="/trade" className="nav__link">
            Trade
          </NavLink>
          {appConfig.features.enableAdmin && (
            <NavLink to="/admin" className="nav__link">
              Admin
            </NavLink>
          )}
        </nav>

        <div className="sidebar__footer">
          <div className="compliance">
            <div className="compliance__title">Compliance</div>
            <div className="compliance__row">
              <span>KYC</span>
              <StatusPill
                tone={
                  compliance?.kycStatus === "approved"
                    ? "good"
                    : compliance?.kycStatus === "pending"
                    ? "warn"
                    : compliance?.kycStatus === "rejected"
                    ? "bad"
                    : "info"
                }
                label={compliance?.kycStatus ?? "unknown"}
              />
            </div>
            <div className="compliance__row">
              <span>Whitelist</span>
              <StatusPill
                tone={compliance?.whitelisted ? "good" : "bad"}
                label={compliance?.whitelisted ? "enabled" : "blocked"}
              />
            </div>
            <div className="compliance__row">
              <span>Blacklist</span>
              <StatusPill
                tone={compliance?.blacklisted ? "bad" : "good"}
                label={compliance?.blacklisted ? "yes" : "no"}
              />
            </div>
          </div>
          <p className="sidebar__hint">
            On-chain controls are enforced in smart contracts. UI mirrors real
            state.
          </p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Tokenized Asset Platform</h1>
            <p>Real-world assets, on-chain compliance, live sync.</p>
          </div>
          <WalletButton />
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
};
