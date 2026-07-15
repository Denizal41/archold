import { createWalletClient, custom } from "viem";
import { arcTestnet, escrowAbi, USDC_ADDRESS, usdcAbi } from "../arc";
import { arcClient } from "./arcClient";
import type { Address, Hash } from "viem";
import type { EscrowRecord, SettlementAction } from "../types/escrow";

export interface OnchainEscrowInput {
  readonly recipient: Address;
  readonly amount: bigint;
  readonly deadline: bigint;
  readonly title: string;
}

const getWalletClient = () => {
  if (!window.ethereum) throw new Error("No EVM wallet was detected.");
  return createWalletClient({ chain: arcTestnet, transport: custom(window.ethereum) });
};

const waitForHash = async (hash: Hash): Promise<void> => {
  await arcClient.waitForTransactionReceipt({ hash });
};

export const createOnchainEscrow = async (
  account: Address,
  contract: Address,
  input: OnchainEscrowInput,
): Promise<Hash> => {
  const wallet = getWalletClient();
  const approval = await wallet.writeContract({
    account, address: USDC_ADDRESS, abi: usdcAbi,
    functionName: "approve", args: [contract, input.amount],
  });
  await waitForHash(approval);
  const hash = await wallet.writeContract({
    account, address: contract, abi: escrowAbi, functionName: "createEscrow",
    args: [input.recipient, input.amount, input.deadline, input.title],
  });
  await waitForHash(hash);
  return hash;
};

export const deployEscrowContract = async (account: Address): Promise<{ address: Address; hash: Hash }> => {
  const { arcHoldBytecode } = await import("../contractBytecode");
  const hash = await getWalletClient().deployContract({
    account, abi: escrowAbi, bytecode: arcHoldBytecode, args: [USDC_ADDRESS],
  });
  const receipt = await arcClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error("Deployment receipt did not include a contract address.");
  return { address: receipt.contractAddress, hash };
};

export const settleOnchainEscrow = async (
  account: Address,
  contract: Address,
  record: EscrowRecord,
  action: SettlementAction,
): Promise<Hash> => {
  const hash = await getWalletClient().writeContract({
    account, address: contract, abi: escrowAbi, functionName: action, args: [record.id],
  });
  await waitForHash(hash);
  return hash;
};

export const submitOnchainDelivery = async (
  account: Address,
  contract: Address,
  record: EscrowRecord,
  proofUri: string,
): Promise<Hash> => {
  const hash = await getWalletClient().writeContract({
    account, address: contract, abi: escrowAbi,
    functionName: "submitDelivery", args: [record.id, proofUri],
  });
  await waitForHash(hash);
  return hash;
};
