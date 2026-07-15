import { useCallback, useEffect, useRef, useState } from "react";
import { ARC_CHAIN_HEX } from "../arc";
import {
  fetchWalletState, getWalletProvider, parseWalletAccounts,
  requestArcNetwork, requestWalletAccounts,
} from "../data/walletGateway";
import { getErrorCode, getFriendlyError } from "../utils/errors";
import type { Address } from "viem";
import type { WalletState } from "../types/wallet";

const EMPTY_WALLET: WalletState = { isCorrectNetwork: false };
const UNSUPPORTED_METHOD_CODE = 4_200;
const METHOD_NOT_FOUND_CODE = -32_601;
const UNKNOWN_CHAIN_CODE = 4_902;

export interface ArcWalletController extends WalletState {
  readonly error?: string;
  connect(): Promise<Address | undefined>;
  switchAccount(): Promise<Address | undefined>;
  switchNetwork(): Promise<void>;
  refresh(): Promise<void>;
}

interface WalletStore {
  readonly wallet: WalletState;
  readonly error?: string;
  setError(message?: string): void;
  clearWallet(): void;
  refreshAddress(address: Address): Promise<void>;
}

const useWalletStore = (): WalletStore => {
  const [wallet, setWallet] = useState<WalletState>(EMPTY_WALLET);
  const [error, setError] = useState<string>();
  const requestSequence = useRef(0);
  const refreshAddress = useCallback(async (address: Address): Promise<void> => {
    const sequence = ++requestSequence.current;
    const provider = getWalletProvider();
    if (!provider) return;
    try {
      const nextWallet = await fetchWalletState(provider, address);
      if (sequence === requestSequence.current) { setWallet(nextWallet); setError(undefined); }
    } catch (refreshError) {
      if (sequence === requestSequence.current) setError(getFriendlyError(refreshError));
    }
  }, []);
  const clearWallet = useCallback((): void => {
    ++requestSequence.current;
    setWallet(EMPTY_WALLET);
  }, []);
  return { wallet, error, setError, clearWallet, refreshAddress };
};

const useWalletEvents = (store: WalletStore): void => {
  useEffect(() => {
    const provider = getWalletProvider();
    if (!provider?.on) return;
    const handleAccounts = (value: unknown): void => {
      try {
        const account = parseWalletAccounts(value)[0];
        if (account) void store.refreshAddress(account); else store.clearWallet();
      } catch (accountError) { store.setError(getFriendlyError(accountError)); }
    };
    const handleChain = (): void => {
      if (store.wallet.address) void store.refreshAddress(store.wallet.address);
    };
    provider.on("accountsChanged", handleAccounts);
    provider.on("chainChanged", handleChain);
    return () => {
      provider.removeListener?.("accountsChanged", handleAccounts);
      provider.removeListener?.("chainChanged", handleChain);
    };
  }, [store]);
};

const getSwitchAccountError = (error: unknown): string => {
  const code = getErrorCode(error);
  if (code === UNSUPPORTED_METHOD_CODE || code === METHOD_NOT_FOUND_CODE) {
    return "Switch accounts inside your wallet, then refresh.";
  }
  return getFriendlyError(error);
};

const useConnectWallet = (store: WalletStore): (() => Promise<Address | undefined>) =>
  useCallback(async (): Promise<Address | undefined> => {
    const provider = getWalletProvider();
    if (!provider) { store.setError("Install MetaMask, Rabby, or another EVM wallet to continue."); return undefined; }
    try {
      const account = (await requestWalletAccounts(provider))[0];
      if (!account) throw new Error("No wallet account was selected.");
      await store.refreshAddress(account);
      return account;
    } catch (error) { store.setError(getFriendlyError(error)); return undefined; }
  }, [store]);

const useSwitchAccount = (
  store: WalletStore,
  connect: () => Promise<Address | undefined>,
): (() => Promise<Address | undefined>) => useCallback(async (): Promise<Address | undefined> => {
    const provider = getWalletProvider();
    if (!provider) return connect();
    try {
      await provider.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
      const account = (await requestWalletAccounts(provider))[0];
      if (account) await store.refreshAddress(account);
      return account;
    } catch (error) { store.setError(getSwitchAccountError(error)); return undefined; }
  }, [connect, store]);

const useSwitchNetwork = (
  store: WalletStore,
  connect: () => Promise<Address | undefined>,
): (() => Promise<void>) => useCallback(async (): Promise<void> => {
    const provider = getWalletProvider();
    if (!provider) { await connect(); return; }
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN_HEX }] });
    } catch (error) {
      if (getErrorCode(error) !== UNKNOWN_CHAIN_CODE) { store.setError(getFriendlyError(error)); return; }
      await requestArcNetwork(provider);
    }
    if (store.wallet.address) await store.refreshAddress(store.wallet.address);
  }, [connect, store]);

export const useArcWallet = (): ArcWalletController => {
  const store = useWalletStore();
  useWalletEvents(store);
  const connect = useConnectWallet(store);
  const switchAccount = useSwitchAccount(store, connect);
  const switchNetwork = useSwitchNetwork(store, connect);
  const refresh = useCallback(async (): Promise<void> => {
    if (store.wallet.address) await store.refreshAddress(store.wallet.address);
  }, [store]);
  return { ...store.wallet, error: store.error, connect, switchAccount, switchNetwork, refresh };
};
