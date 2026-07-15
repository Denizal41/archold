import type { Address, Hash } from "viem";

export type EscrowStatus = 0 | 1 | 2 | 3;
export type SettlementAction = "release" | "refund" | "claim";
export type ContractCompatibility = "missing" | "checking" | "compatible" | "incompatible" | "error";

export interface EscrowRecord {
  readonly id: bigint;
  readonly payer: Address;
  readonly payee: Address;
  readonly amount: bigint;
  readonly deadline: bigint;
  readonly status: EscrowStatus;
  readonly description: string;
  readonly submittedAt: bigint;
  readonly claimableAt: bigint;
  readonly proofUri: string;
}

export interface EscrowSummary {
  readonly recordCount: number;
  readonly protectedValue: bigint;
}

export interface Notice {
  readonly message: string;
  readonly hash?: Hash;
}

export interface CreateEscrowInput {
  readonly recipient: string;
  readonly amount: string;
  readonly title: string;
  readonly deadline: string;
}
