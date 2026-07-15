import { isAddress } from "viem";
import { ARC_CONTRACT_VERSION, escrowAbi } from "../arc";
import { arcClient } from "./arcClient";
import type { Address } from "viem";
import type { EscrowRecord, EscrowStatus, EscrowSummary } from "../types/escrow";

const RECORD_PAGE_SIZE = 20n;

const isBigInt = (value: unknown): value is bigint => typeof value === "bigint";
const isString = (value: unknown): value is string => typeof value === "string";
const isStatus = (value: unknown): value is EscrowStatus =>
  typeof value === "number" && value >= 0 && value <= 3;

const isEscrowTuple = (value: unknown): value is readonly [Address, Address, bigint, bigint, EscrowStatus, string] =>
  Array.isArray(value)
  && value.length === 6
  && isAddress(value[0])
  && isAddress(value[1])
  && isBigInt(value[2])
  && isBigInt(value[3])
  && isStatus(value[4])
  && isString(value[5]);

const isDeliveryTuple = (value: unknown): value is readonly [bigint, bigint, string] =>
  Array.isArray(value)
  && value.length === 3
  && isBigInt(value[0])
  && isBigInt(value[1])
  && isString(value[2]);

const createRecord = (id: bigint, escrow: unknown, delivery: unknown): EscrowRecord => {
  if (!isEscrowTuple(escrow) || !isDeliveryTuple(delivery)) {
    throw new Error(`Escrow #${id} returned an invalid Arc RPC payload.`);
  }
  return {
    id,
    payer: escrow[0],
    payee: escrow[1],
    amount: escrow[2],
    deadline: escrow[3],
    status: escrow[4],
    description: escrow[5],
    submittedAt: delivery[0],
    claimableAt: delivery[1],
    proofUri: delivery[2],
  };
};

export const fetchContractVersion = async (contract: Address): Promise<bigint> =>
  arcClient.readContract({ address: contract, abi: escrowAbi, functionName: "contractVersion" });

export const isSupportedContract = async (contract: Address): Promise<boolean> =>
  (await fetchContractVersion(contract)) === ARC_CONTRACT_VERSION;

export const fetchEscrowSummary = async (account: Address, contract: Address): Promise<EscrowSummary> => {
  const [recordCount, protectedValue] = await arcClient.multicall({
    allowFailure: false,
    contracts: [
      { address: contract, abi: escrowAbi, functionName: "getEscrowCount", args: [account] },
      { address: contract, abi: escrowAbi, functionName: "activeValueByParty", args: [account] },
    ],
  });
  return { recordCount: Number(recordCount), protectedValue };
};

const fetchPageIds = async (account: Address, contract: Address, count: number): Promise<readonly bigint[]> => {
  const total = BigInt(count);
  const offset = total > RECORD_PAGE_SIZE ? total - RECORD_PAGE_SIZE : 0n;
  return arcClient.readContract({
    address: contract,
    abi: escrowAbi,
    functionName: "getEscrowIdsPage",
    args: [account, offset, RECORD_PAGE_SIZE],
  });
};

const hydrateRecords = async (ids: readonly bigint[], contract: Address): Promise<readonly EscrowRecord[]> => {
  const calls = ids.flatMap((id) => [
    { address: contract, abi: escrowAbi, functionName: "escrows" as const, args: [id] as const },
    { address: contract, abi: escrowAbi, functionName: "deliveries" as const, args: [id] as const },
  ]);
  const results: readonly unknown[] = await arcClient.multicall({ contracts: calls, allowFailure: false });
  return ids.map((id, index) => createRecord(id, results[index * 2], results[index * 2 + 1])).reverse();
};

export const fetchEscrowRecords = async (
  account: Address,
  contract: Address,
): Promise<{ readonly records: readonly EscrowRecord[]; readonly summary: EscrowSummary }> => {
  const summary = await fetchEscrowSummary(account, contract);
  const ids = await fetchPageIds(account, contract, summary.recordCount);
  const records = await hydrateRecords(ids, contract);
  return { records, summary };
};
