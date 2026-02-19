import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { NetworkGate } from "../components/NetworkGate";
import { appConfig } from "../config/appConfig";
import { uniswapV3RouterAbi } from "../config/abis";
import { useApp } from "../context/AppContext";
import { getDexQuote, submitSwap } from "../services/indexer";
import { writeContract } from "../services/contracts";
import type { DexQuote } from "../types";
import { parseUnits } from "ethers";

export const Trade = () => {
  const { assets, signer, wallet } = useApp();
  const fungibleAssets = useMemo(
    () => assets.filter((asset) => asset.type === "fungible"),
    [assets]
  );
  const [assetIn, setAssetIn] = useState<string>("");
  const [assetOut, setAssetOut] = useState<string>("");
  const [amountIn, setAmountIn] = useState<string>("");
  const [quote, setQuote] = useState<DexQuote>();
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    if (fungibleAssets.length > 0) {
      setAssetIn(fungibleAssets[0].id);
      setAssetOut(fungibleAssets[0].id);
    }
  }, [fungibleAssets]);

  const handleQuote = async () => {
    if (!assetIn || !assetOut || !amountIn) {
      setStatus("Fill in assets and amount to quote.");
      return;
    }
    const quoteResult = await getDexQuote(assetIn, assetOut, amountIn);
    setQuote(quoteResult);
  };

  const handleSwap = async () => {
    try {
      if (!amountIn) {
        setStatus("Enter an amount to swap.");
        return;
      }
      setStatus("Submitting swap...");
      const inAsset = fungibleAssets.find((asset) => asset.id === assetIn);
      const outAsset = fungibleAssets.find((asset) => asset.id === assetOut);
      if (!inAsset || !outAsset) {
        setStatus("Select valid fungible assets.");
        return;
      }
      if (appConfig.dex.type === "uniswap-v3" && signer && wallet.address) {
        const amountParsed = parseUnits(
          amountIn,
          inAsset.decimals ?? 18
        );
        const minOut = quote?.minAmountOut ?? "0";
        const minParsed = parseUnits(
          minOut,
          outAsset.decimals ?? 18
        );
        const deadline = Math.floor(Date.now() / 1000) + appConfig.dex.deadlineMinutes * 60;
        await writeContract(
          signer,
          appConfig.contracts.dexRouter,
          uniswapV3RouterAbi,
          "exactInputSingle",
          [
            {
              tokenIn: inAsset.tokenAddress,
              tokenOut: outAsset.tokenAddress,
              fee: appConfig.dex.fee,
              recipient: wallet.address,
              deadline,
              amountIn: amountParsed,
              amountOutMinimum: minParsed,
              sqrtPriceLimitX96: 0
            }
          ]
        );
        setStatus("Swap sent to router.");
        return;
      }
      await submitSwap({
        assetIn,
        assetOut,
        amountIn,
        slippageBps: appConfig.dex.slippageBpsDefault
      });
      setStatus("Swap submitted. Check wallet for signature.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  return (
    <div className="page">
      <SectionHeader
        title="Trade"
        subtitle="Trade whitelisted assets through the on-chain liquidity pool."
      />
      <NetworkGate>
        {fungibleAssets.length === 0 ? (
          <div className="empty">
            <h3>No fungible assets</h3>
            <p>Mint a fungible token before trading on the DEX.</p>
          </div>
        ) : (
          <div className="grid grid--two">
            <div className="card form">
              <h3>Swap</h3>
              <label>
                Asset in
                <select value={assetIn} onChange={(event) => setAssetIn(event.target.value)}>
                  {fungibleAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.symbol ?? asset.type})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Asset out
                <select value={assetOut} onChange={(event) => setAssetOut(event.target.value)}>
                  {fungibleAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.symbol ?? asset.type})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Amount in
                <input value={amountIn} onChange={(event) => setAmountIn(event.target.value)} placeholder="0.0" />
              </label>
              <div className="form__actions">
                <button className="btn btn--ghost" type="button" onClick={handleQuote}>
                  Get quote
                </button>
                <button className="btn btn--primary" type="button" onClick={handleSwap}>
                  Swap on-chain
                </button>
              </div>
            </div>
            <div className="card swap-summary">
              <h3>Pool details</h3>
              <div className="swap-summary__row">
                <span className="muted">DEX</span>
                <strong>{appConfig.dex.type}</strong>
              </div>
              <div className="swap-summary__row">
                <span className="muted">Pool</span>
                <strong>{appConfig.contracts.dexPool}</strong>
              </div>
              <div className="swap-summary__row">
                <span className="muted">Router</span>
                <strong>{appConfig.contracts.dexRouter}</strong>
              </div>
              <div className="divider" />
              {quote ? (
                <>
                  <div className="swap-summary__row">
                    <span className="muted">Amount out</span>
                    <strong>{quote.amountOut}</strong>
                  </div>
                  <div className="swap-summary__row">
                    <span className="muted">Min received</span>
                    <strong>{quote.minAmountOut}</strong>
                  </div>
                  <div className="swap-summary__row">
                    <span className="muted">Price impact</span>
                    <strong>{quote.priceImpact}</strong>
                  </div>
                  <div className="swap-summary__row">
                    <span className="muted">Route</span>
                    <strong>{quote.route}</strong>
                  </div>
                  <div className="swap-summary__row">
                    <span className="muted">Fee</span>
                    <strong>{quote.fee}</strong>
                  </div>
                </>
              ) : (
                <p className="muted">Request a quote to view expected outputs.</p>
              )}
            </div>
          </div>
        )}
      </NetworkGate>
      {status && <div className="notice">{status}</div>}
    </div>
  );
};
