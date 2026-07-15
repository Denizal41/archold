import { useCallback, useState } from "react";
import { isAddress } from "viem";
import { useArcWallet } from "./useArcWallet";
import { useCurrentTimestamp } from "./useCurrentTimestamp";
import { useEscrowContract } from "./useEscrowContract";
import { useEscrowRecords } from "./useEscrowRecords";
import { useEscrowTransactions } from "./useEscrowTransactions";
import type { Address } from "viem";
import type { ArcWalletController } from "./useArcWallet";
import type { EscrowRecordsController } from "./useEscrowRecords";
import type { EscrowTransactionsController } from "./useEscrowTransactions";
import type { ContractCompatibility, CreateEscrowInput, EscrowRecord, Notice, SettlementAction } from "../types/escrow";

export interface ArcHoldController {
  readonly contract?: Address;
  readonly compatibility: ContractCompatibility;
  readonly wallet: ArcWalletController;
  readonly records: EscrowRecordsController;
  readonly transactions: EscrowTransactionsController;
  readonly notice?: Notice;
  readonly now: number;
  createEscrow(input: CreateEscrowInput): Promise<void>;
  deployContract(): Promise<void>;
  settleEscrow(record: EscrowRecord, action: SettlementAction): Promise<void>;
}

interface ActionContext {
  readonly compatibility: ContractCompatibility;
  readonly wallet: ArcWalletController;
  readonly transactions: EscrowTransactionsController;
  setContract(address: Address): void;
}

const getConfiguredContract = (): Address | undefined => {
  const configured = import.meta.env.VITE_ESCROW_ADDRESS;
  return configured && isAddress(configured) ? configured : undefined;
};

const getNotice = (transaction?: Notice, ...errors: readonly (string | undefined)[]): Notice | undefined => {
  if (transaction) return transaction;
  const error = errors.find(Boolean);
  return error ? { message: error } : undefined;
};

const prepareTransaction = async (context: ActionContext): Promise<boolean> => {
  if (!context.wallet.address) { await context.wallet.connect(); return false; }
  if (!context.wallet.isCorrectNetwork) { await context.wallet.switchNetwork(); return false; }
  return context.compatibility === "compatible";
};

const createActions = (context: ActionContext) => ({
  createEscrow: async (input: CreateEscrowInput): Promise<void> => {
    if (await prepareTransaction(context)) await context.transactions.createEscrow(input);
  },
  deployContract: async (): Promise<void> => {
    if (!context.wallet.address) { await context.wallet.connect(); return; }
    if (!context.wallet.isCorrectNetwork) { await context.wallet.switchNetwork(); return; }
    const deployed = await context.transactions.deployContract();
    if (deployed) context.setContract(deployed);
  },
  settleEscrow: async (record: EscrowRecord, action: SettlementAction): Promise<void> => {
    if (await prepareTransaction(context)) await context.transactions.settle(record, action);
  },
});

export const useArcHoldApp = (): ArcHoldController => {
  const [contract, setContract] = useState<Address | undefined>(getConfiguredContract);
  const wallet = useArcWallet();
  const compatibility = useEscrowContract(contract);
  const records = useEscrowRecords(wallet.address, contract, compatibility === "compatible");
  const now = useCurrentTimestamp();
  const refreshWallet = wallet.refresh;
  const reloadRecords = records.reload;
  const handleMutation = useCallback(async (): Promise<void> => {
    await Promise.all([refreshWallet(), reloadRecords()]);
  }, [refreshWallet, reloadRecords]);
  const transactions = useEscrowTransactions(wallet.address, contract, handleMutation);
  const incompatible = compatibility === "incompatible"
    ? "Configured contract is not ArcHold V3. Transactions are disabled."
    : compatibility === "error" ? "Arc RPC verification is unavailable. Retrying automatically." : undefined;
  const notice = getNotice(transactions.notice, wallet.error, records.error, incompatible);
  const actions = createActions({ compatibility, wallet, transactions, setContract });
  return { contract, compatibility, wallet, records, transactions, notice, now, ...actions };
};
