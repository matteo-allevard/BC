import { BrowserProvider } from "ethers";

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const getBrowserProvider = () => {
  if (!window.ethereum) {
    throw new Error("No wallet found. Install a compatible wallet.");
  }
  return new BrowserProvider(window.ethereum);
};

export const connectWallet = async () => {
  const provider = getBrowserProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, chainId: Number(network.chainId) };
};

export const getCurrentAccount = async () => {
  const provider = getBrowserProvider();
  const accounts = (await provider.send("eth_accounts", [])) as string[];
  const network = await provider.getNetwork();
  return { accounts, chainId: Number(network.chainId) };
};

export const switchChain = async (chainId: number) => {
  if (!window.ethereum) {
    throw new Error("No wallet provider found.");
  }
  const hexChainId = `0x${chainId.toString(16)}`;
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: hexChainId }]
  });
};

export const onWalletEvents = (
  handleAccounts: (accounts: string[]) => void,
  handleChain: (chainId: number) => void
) => {
  const provider = window.ethereum;
  if (!provider?.on) return () => {};

  const onAccountsChanged = (accounts: unknown) => {
    handleAccounts((accounts as string[]) ?? []);
  };

  const onChainChanged = (chainId: unknown) => {
    const parsed = typeof chainId === "string" ? parseInt(chainId, 16) : Number(chainId);
    handleChain(parsed);
  };

  provider.on("accountsChanged", onAccountsChanged);
  provider.on("chainChanged", onChainChanged);

  return () => {
    provider.removeListener?.("accountsChanged", onAccountsChanged);
    provider.removeListener?.("chainChanged", onChainChanged);
  };
};
