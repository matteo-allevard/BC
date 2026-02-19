import { useState, type FormEvent } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { NetworkGate } from "../components/NetworkGate";
import { appConfig } from "../config/appConfig";
import { tokenFactoryAbi, nftFactoryAbi } from "../config/abis";
import { useApp } from "../context/AppContext";
import { writeContract } from "../services/contracts";

export const Tokenize = () => {
  const { signer } = useApp();
  const [fungibleForm, setFungibleForm] = useState({
    name: "",
    symbol: "",
    decimals: 6,
    supply: "",
    metadataUri: ""
  });
  const [nftForm, setNftForm] = useState({
    name: "",
    symbol: "",
    baseUri: "",
    mintTo: "",
    tokenUri: ""
  });
  const [status, setStatus] = useState<string>();

  const handleFungibleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!signer) {
      setStatus("Connect a wallet to mint.");
      return;
    }
    try {
      setStatus("Submitting fungible tokenization...");
      await writeContract(
        signer,
        appConfig.contracts.tokenFactory,
        tokenFactoryAbi,
        "createToken",
        [
          fungibleForm.name,
          fungibleForm.symbol,
          Number(fungibleForm.decimals),
          fungibleForm.supply,
          fungibleForm.metadataUri
        ]
      );
      setStatus("Fungible token created on-chain.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleNftSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!signer) {
      setStatus("Connect a wallet to mint.");
      return;
    }
    try {
      setStatus("Submitting NFT collection...");
      await writeContract(
        signer,
        appConfig.contracts.nftFactory,
        nftFactoryAbi,
        "createCollection",
        [nftForm.name, nftForm.symbol, nftForm.baseUri]
      );
      setStatus("NFT collection created.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleMintNft = async (event: FormEvent) => {
    event.preventDefault();
    if (!signer) {
      setStatus("Connect a wallet to mint.");
      return;
    }
    try {
      setStatus("Minting NFT...");
      await writeContract(
        signer,
        appConfig.contracts.nftFactory,
        nftFactoryAbi,
        "safeMint",
        [nftForm.mintTo, nftForm.tokenUri]
      );
      setStatus("NFT minted on-chain.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  return (
    <div className="page">
      <SectionHeader
        title="Tokenize"
        subtitle="Mint fungible shares or unique NFTs for real-world assets."
      />

      <NetworkGate>
        <div className="grid grid--two">
          <form className="card form" onSubmit={handleFungibleSubmit}>
            <h3>Fungible RWA</h3>
            <label>
              Asset name
              <input
                value={fungibleForm.name}
                onChange={(event) =>
                  setFungibleForm({ ...fungibleForm, name: event.target.value })
                }
                placeholder="e.g. Lyon Commercial Shares"
              />
            </label>
            <label>
              Symbol
              <input
                value={fungibleForm.symbol}
                onChange={(event) =>
                  setFungibleForm({ ...fungibleForm, symbol: event.target.value })
                }
                placeholder="LYON"
              />
            </label>
            <label>
              Decimals
              <input
                type="number"
                value={fungibleForm.decimals}
                onChange={(event) =>
                  setFungibleForm({
                    ...fungibleForm,
                    decimals: Number(event.target.value)
                  })
                }
              />
            </label>
            <label>
              Initial supply
              <input
                value={fungibleForm.supply}
                onChange={(event) =>
                  setFungibleForm({ ...fungibleForm, supply: event.target.value })
                }
                placeholder="1000000"
              />
            </label>
            <label>
              Metadata URI
              <input
                value={fungibleForm.metadataUri}
                onChange={(event) =>
                  setFungibleForm({
                    ...fungibleForm,
                    metadataUri: event.target.value
                  })
                }
                placeholder="ipfs://..."
              />
            </label>
            <button className="btn btn--primary" type="submit">
              Create token
            </button>
          </form>

          <form className="card form" onSubmit={handleNftSubmit}>
            <h3>Unique NFT Collection</h3>
            <label>
              Collection name
              <input
                value={nftForm.name}
                onChange={(event) =>
                  setNftForm({ ...nftForm, name: event.target.value })
                }
                placeholder="e.g. Bordeaux Art Vault"
              />
            </label>
            <label>
              Symbol
              <input
                value={nftForm.symbol}
                onChange={(event) =>
                  setNftForm({ ...nftForm, symbol: event.target.value })
                }
                placeholder="BART"
              />
            </label>
            <label>
              Base metadata URI
              <input
                value={nftForm.baseUri}
                onChange={(event) =>
                  setNftForm({ ...nftForm, baseUri: event.target.value })
                }
                placeholder="ipfs://collection/"
              />
            </label>
            <button className="btn btn--primary" type="submit">
              Create collection
            </button>
            <div className="divider" />
            <h4>Mint NFT</h4>
            <label>
              Recipient
              <input
                value={nftForm.mintTo}
                onChange={(event) =>
                  setNftForm({ ...nftForm, mintTo: event.target.value })
                }
                placeholder="0x..."
              />
            </label>
            <label>
              Token URI
              <input
                value={nftForm.tokenUri}
                onChange={(event) =>
                  setNftForm({ ...nftForm, tokenUri: event.target.value })
                }
                placeholder="ipfs://token/1"
              />
            </label>
            <button className="btn btn--ghost" onClick={handleMintNft}>
              Mint NFT
            </button>
          </form>
        </div>
      </NetworkGate>
      {status && <div className="notice">{status}</div>}
    </div>
  );
};
