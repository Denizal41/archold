import { useCallback, useState } from "react";
import { getAddress, isAddress, parseUnits } from "viem";
import {
  createOnchainEscrow, deployEscrowContract,
  settleOnchainEscrow, submitOnchainDelivery,
} from "../data/escrowTransactions";
import { getFriendlyError } from "../utils/errors";
import { getProofHref } from "../utils/proofLink";
import type { Address, Hash } from "viem";
import type { OnchainEscrowInput } from "../data/escrowTransactions";
import type { CreateEscrowInput, EscrowRecord, Notice, SettlementAction } from "../types/escrow";

const AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/;
const MAX_TITLE_LENGTH = 160;
const MAX_PROOF_URI_LENGTH = 240;
const USDC_DECIMALS = 6;
const MILLISECONDS_PER_SECOND = 1_000;
const SETTLEMENT_MESSAGES: Record<SettlementAction, string> = {
  release: "Payment released to the contractor.",
  refund: "Escrow refunded to the payer.",
  claim: "Payment claimed by the contractor after review.",
};

export interface EscrowTransactionsController {
  readonly busyAction?: string;
  readonly notice?: Notice;
  createEscrow(input: CreateEscrowInput): Promise<void>;
  deployContract(): Promise<Address | undefined>;
  settle(record: EscrowRecord, action: SettlementAction): Promise<void>;
  submitDelivery(record: EscrowRecord, proofUri: string): Promise<boolean>;
}

interface TransactionRunner {
  readonly busyAction?: string;
  readonly notice?: Notice;
  execute<TValue>(action: string, operation: () => Promise<TValue>): Promise<TValue | undefined>;
  setSuccess(message: string, hash: Hash): void;
}

interface TransactionContext {
  readonly account?: Address;
  readonly contract?: Address;
  readonly onMutation: () => Promise<void>;
  readonly runner: TransactionRunner;
}

const validateEscrowInput = (input: CreateEscrowInput): OnchainEscrowInput => {
  const title = input.title.trim();
  if (!isAddress(input.recipient)) throw new Error("Enter a valid contractor address.");
  if (!AMOUNT_PATTERN.test(input.amount) || parseUnits(input.amount, USDC_DECIMALS) <= 0n) {
    throw new Error("Enter a positive USDC amount with up to 6 decimals.");
  }
  if (!title || title.length > MAX_TITLE_LENGTH) throw new Error("Enter a job title up to 160 characters.");
  const timestamp = new Date(`${input.deadline}T23:59:59Z`).getTime();
  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) throw new Error("Choose a future delivery deadline.");
  return {
    recipient: getAddress(input.recipient), amount: parseUnits(input.amount, USDC_DECIMALS),
    deadline: BigInt(Math.floor(timestamp / MILLISECONDS_PER_SECOND)), title,
  };
};

const useTransactionRunner = (): TransactionRunner => {
  const [busyAction, setBusyAction] = useState<string>();
  const [notice, setNotice] = useState<Notice>();
  const execute = useCallback(async <TValue,>(
    action: string,
    operation: () => Promise<TValue>,
  ): Promise<TValue | undefined> => {
    setBusyAction(action);
    setNotice(undefined);
    try { return await operation(); }
    catch (error) { setNotice({ message: getFriendlyError(error) }); return undefined; }
    finally { setBusyAction(undefined); }
  }, []);
  const setSuccess = useCallback((message: string, hash: Hash): void => {
    setNotice({ message, hash });
  }, []);
  return { busyAction, notice, execute, setSuccess };
};

const requireConnection = (account?: Address, contract?: Address): { account: Address; contract: Address } => {
  if (!account || !contract) throw new Error("Connect a wallet and configure the V3 contract first.");
  return { account, contract };
};

export const useEscrowTransactions = (
  account: Address | undefined,
  contract: Address | undefined,
  onMutation: () => Promise<void>,
): EscrowTransactionsController => {
  const runner = useTransactionRunner();
  const context = { account, contract, onMutation, runner };
  const createEscrow = useCreateEscrow(context);
  const deployContract = useDeployContract(context);
  const settle = useSettleEscrow(context);
  const submitDelivery = useSubmitDelivery(context);
  return { ...runner, createEscrow, deployContract, settle, submitDelivery };
};

const useCreateEscrow = (context: TransactionContext) =>
  async (input: CreateEscrowInput): Promise<void> => {
    const hash = await context.runner.execute("create", async () => {
      const connection = requireConnection(context.account, context.contract);
      return createOnchainEscrow(connection.account, connection.contract, validateEscrowInput(input));
    });
    if (!hash) return;
    context.runner.setSuccess("Escrow created and funded on Arc Testnet.", hash);
    await context.onMutation();
  };

const useDeployContract = (context: TransactionContext) =>
  async (): Promise<Address | undefined> => {
    const deployment = await context.runner.execute("deploy", async () => {
      if (!context.account) throw new Error("Connect a wallet before deploying.");
      return deployEscrowContract(context.account);
    });
    if (!deployment) return undefined;
    context.runner.setSuccess(`ArcHold V3 deployed at ${deployment.address}.`, deployment.hash);
    return deployment.address;
  };

const useSettleEscrow = (context: TransactionContext) =>
  async (record: EscrowRecord, action: SettlementAction): Promise<void> => {
    const hash = await context.runner.execute(`${action}-${record.id}`, async () => {
      const connection = requireConnection(context.account, context.contract);
      return settleOnchainEscrow(connection.account, connection.contract, record, action);
    });
    if (!hash) return;
    context.runner.setSuccess(SETTLEMENT_MESSAGES[action], hash);
    await context.onMutation();
  };

const useSubmitDelivery = (context: TransactionContext) =>
  async (record: EscrowRecord, proofUri: string): Promise<boolean> => {
    const hash = await context.runner.execute(`deliver-${record.id}`, async () => {
      const connection = requireConnection(context.account, context.contract);
      const uri = proofUri.trim();
      if (!getProofHref(uri) || uri.length > MAX_PROOF_URI_LENGTH) {
        throw new Error("Enter a public HTTPS or IPFS proof link without credentials.");
      }
      return submitOnchainDelivery(connection.account, connection.contract, record, uri);
    });
    if (!hash) return false;
    context.runner.setSuccess("Delivery proof submitted on Arc Testnet.", hash);
    await context.onMutation();
    return true;
  };
