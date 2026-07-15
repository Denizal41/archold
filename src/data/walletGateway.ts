import { getAddress, isAddress } from "viem";
import { ARC_CHAIN_HEX, ARC_CHAIN_ID, ARC_EXPLORER, ARC_RPC_URLS, USDC_ADDRESS, usdcAbi } from "../arc";
import { arcClient } from "./arcClient";
import type { Address } from "viem";
import type { EthereumProvider, WalletState } from "../types/wallet";

export const getWalletProvider = (): EthereumProvider | undefined => window.ethereum;

export const parseWalletAccounts = (value: unknown): readonly Address[] => {
  if (!Array.isArray(value)) throw new Error("The wallet returned an invalid account list.");
  return value.map((account) => {
    if (typeof account !== "string" || !isAddress(account)) {
      throw new Error("The wallet returned an invalid account address.");
    }
    return getAddress(account);
  });
};

export const requestWalletAccounts = async (provider: EthereumProvider): Promise<readonly Address[]> =>
  parseWalletAccounts(await provider.request({ method: "eth_requestAccounts" }));

export const fetchWalletState = async (provider: EthereumProvider, address: Address): Promise<WalletState> => {
  const [gasBalance, tokenBalance, chainId] = await Promise.all([
    arcClient.getBalance({ address }),
    arcClient.readContract({ address: USDC_ADDRESS, abi: usdcAbi, functionName: "balanceOf", args: [address] }),
    provider.request({ method: "eth_chainId" }),
  ]);
  const isCorrectNetwork = typeof chainId === "string"
    && /^0x[0-9a-f]+$/i.test(chainId)
    && Number(chainId) === ARC_CHAIN_ID;
  return { address, gasBalance, tokenBalance, isCorrectNetwork };
};

export const requestArcNetwork = async (provider: EthereumProvider): Promise<void> => {
  await provider.request({ method: "wallet_addEthereumChain", params: [{
    chainId: ARC_CHAIN_HEX,
    chainName: "Arc Testnet",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    rpcUrls: [...ARC_RPC_URLS],
    blockExplorerUrls: [ARC_EXPLORER],
  }] });
};
