import type { Address } from "viem";

export interface ProviderRequest {
  readonly method: string;
  readonly params?: readonly unknown[];
}

export interface EthereumProvider {
  request(request: ProviderRequest): Promise<unknown>;
  on?(event: string, listener: (...arguments_: unknown[]) => void): void;
  removeListener?(event: string, listener: (...arguments_: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export interface WalletState {
  readonly address?: Address;
  readonly tokenBalance?: bigint;
  readonly gasBalance?: bigint;
  readonly isCorrectNetwork: boolean;
}
