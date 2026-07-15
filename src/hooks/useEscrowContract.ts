import { useEffect, useState } from "react";
import { isSupportedContract } from "../data/escrowRepository";
import type { Address } from "viem";
import type { ContractCompatibility } from "../types/escrow";

const VERIFY_RETRY_MS = 3_000;

export const useEscrowContract = (contract?: Address): ContractCompatibility => {
  const [result, setResult] = useState<{ contract: Address; compatibility: ContractCompatibility }>();

  useEffect(() => {
    if (!contract) return;
    let isCurrent = true;
    let retry: number | undefined;
    const verify = async (): Promise<void> => {
      setResult({ contract, compatibility: "checking" });
      try {
        const isSupported = await isSupportedContract(contract);
        if (isCurrent) setResult({ contract, compatibility: isSupported ? "compatible" : "incompatible" });
      } catch {
        if (!isCurrent) return;
        setResult({ contract, compatibility: "error" });
        retry = window.setTimeout(() => { void verify(); }, VERIFY_RETRY_MS);
      }
    };
    void verify();
    return () => { isCurrent = false; if (retry !== undefined) window.clearTimeout(retry); };
  }, [contract]);

  if (!contract) return "missing";
  return result?.contract === contract ? result.compatibility : "checking";
};
