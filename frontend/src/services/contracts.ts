import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";

export const getContract = (
  address: string,
  abi: unknown,
  signerOrProvider: BrowserProvider | JsonRpcSigner
) => new Contract(address, abi, signerOrProvider);

export const readContract = async <T>(
  provider: BrowserProvider,
  address: string,
  abi: unknown,
  method: string,
  args: unknown[] = []
) => {
  const contract = getContract(address, abi, provider);
  return (await contract[method](...args)) as T;
};

export const writeContract = async <T>(
  signer: JsonRpcSigner,
  address: string,
  abi: unknown,
  method: string,
  args: unknown[] = []
) => {
  const contract = getContract(address, abi, signer);
  return (await contract[method](...args)) as T;
};
