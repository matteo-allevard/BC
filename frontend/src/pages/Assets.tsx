import { useMemo, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { AssetCard } from "../components/AssetCard";
import { useApp } from "../context/AppContext";
import { EmptyState } from "../components/EmptyState";

export const Assets = () => {
  const { assets, oraclePrices } = useApp();
  const [filter, setFilter] = useState<"all" | "fungible" | "nft">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return assets;
    return assets.filter((asset) => asset.type === filter);
  }, [assets, filter]);

  return (
    <div className="page">
      <SectionHeader
        title="Assets"
        subtitle="Browse tokenized real-world assets." 
        action={
          <div className="segmented">
            <button
              className={filter === "all" ? "segmented__btn is-active" : "segmented__btn"}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={filter === "fungible" ? "segmented__btn is-active" : "segmented__btn"}
              onClick={() => setFilter("fungible")}
            >
              Fungible
            </button>
            <button
              className={filter === "nft" ? "segmented__btn is-active" : "segmented__btn"}
              onClick={() => setFilter("nft")}
            >
              NFTs
            </button>
          </div>
        }
      />
      <div className="grid grid--three">
        {filtered.length === 0 ? (
          <EmptyState title="No assets found" subtitle="Try another filter or mint a new asset." />
        ) : (
          filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} oraclePrice={oraclePrices[asset.id]} />
          ))
        )}
      </div>
    </div>
  );
};
