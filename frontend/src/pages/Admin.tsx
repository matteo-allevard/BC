import { useEffect, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { NetworkGate } from "../components/NetworkGate";
import { appConfig } from "../config/appConfig";
import { whitelistAbi } from "../config/abis";
import { useApp } from "../context/AppContext";
import { writeContract } from "../services/contracts";
import { getKycRequests, updateKycStatus } from "../services/indexer";
import type { KycRequest } from "../types";

export const Admin = () => {
  const { signer } = useApp();
  const [targetAddress, setTargetAddress] = useState("");
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const result = await getKycRequests();
        setRequests(result);
      } catch (error) {
        setStatus((error as Error).message);
      }
    };

    loadRequests();
  }, []);

  const updateWhitelist = async (allowed: boolean) => {
    if (!signer) {
      setStatus("Connect a wallet to manage compliance.");
      return;
    }
    try {
      setStatus("Submitting whitelist update...");
      await writeContract(
        signer,
        appConfig.contracts.whitelist,
        whitelistAbi,
        "setWhitelisted",
        [targetAddress, allowed]
      );
      setStatus("Whitelist updated on-chain.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const updateBlacklist = async (blocked: boolean) => {
    if (!signer) {
      setStatus("Connect a wallet to manage compliance.");
      return;
    }
    try {
      setStatus("Submitting blacklist update...");
      await writeContract(
        signer,
        appConfig.contracts.whitelist,
        whitelistAbi,
        "setBlacklisted",
        [targetAddress, blocked]
      );
      setStatus("Blacklist updated on-chain.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleKycDecision = async (id: string, decision: "approved" | "rejected") => {
    try {
      setStatus("Updating KYC status...");
      await updateKycStatus(id, decision);
      setRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, status: decision } : request
        )
      );
      setStatus(`KYC marked as ${decision}.`);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  return (
    <div className="page">
      <SectionHeader
        title="Admin & Compliance"
        subtitle="Review KYC requests and control whitelist/blacklist access."
      />

      <NetworkGate requireWhitelist={false}>
        <div className="grid grid--two">
          <div className="card form">
            <h3>Whitelist / Blacklist</h3>
            <label>
              Wallet address
              <input
                value={targetAddress}
                onChange={(event) => setTargetAddress(event.target.value)}
                placeholder="0x..."
              />
            </label>
            <div className="form__actions">
              <button className="btn btn--primary" type="button" onClick={() => updateWhitelist(true)}>
                Whitelist
              </button>
              <button className="btn btn--ghost" type="button" onClick={() => updateWhitelist(false)}>
                Remove whitelist
              </button>
            </div>
            <div className="form__actions">
              <button className="btn btn--danger" type="button" onClick={() => updateBlacklist(true)}>
                Blacklist
              </button>
              <button className="btn btn--ghost" type="button" onClick={() => updateBlacklist(false)}>
                Unblacklist
              </button>
            </div>
          </div>

          <div className="card">
            <h3>KYC requests</h3>
            {requests.length === 0 ? (
              <p className="muted">No pending KYC requests.</p>
            ) : (
              <div className="kyc-requests">
                {requests.map((request) => (
                  <div key={request.id} className="kyc-requests__item">
                    <div>
                      <div className="kyc-requests__title">{request.name}</div>
                      <div className="muted">{request.address}</div>
                      <div className="muted">
                        Submitted {new Date(request.submittedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="kyc-requests__actions">
                      <span className="pill pill--info">{request.status}</span>
                      <button
                        className="btn btn--ghost"
                        onClick={() => handleKycDecision(request.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn--danger"
                        onClick={() => handleKycDecision(request.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </NetworkGate>
      {status && <div className="notice">{status}</div>}
    </div>
  );
};
