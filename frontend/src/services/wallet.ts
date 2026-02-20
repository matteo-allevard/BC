const WALLET_STORAGE_KEY = "xrpl_wallet_address";

export const saveWalletAddress = (address: string) => {
  localStorage.setItem(WALLET_STORAGE_KEY, address);
};

export const getSavedWalletAddress = (): string | null => {
  return localStorage.getItem(WALLET_STORAGE_KEY);
};

export const clearWalletAddress = () => {
  localStorage.removeItem(WALLET_STORAGE_KEY);
};

export const isValidXrplAddress = (address: string): boolean => {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address);
};
