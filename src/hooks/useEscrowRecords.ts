import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { fetchEscrowRecords } from "../data/escrowRepository";
import { getFriendlyError } from "../utils/errors";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Address } from "viem";
import type { EscrowRecord } from "../types/escrow";

interface EscrowRecordsState {
  readonly records: readonly EscrowRecord[];
  readonly recordCount: number;
  readonly protectedValue: bigint;
  readonly isLoading: boolean;
  readonly error?: string;
}

interface RecordLoadOptions {
  readonly account?: Address;
  readonly contract?: Address;
  readonly isEnabled: boolean;
}

export interface EscrowRecordsController extends EscrowRecordsState {
  reload(): Promise<void>;
}

const EMPTY_RECORDS: EscrowRecordsState = {
  records: [], recordCount: 0, protectedValue: 0n, isLoading: false,
};

const useRecordLoader = (
  options: RecordLoadOptions,
  setState: Dispatch<SetStateAction<EscrowRecordsState>>,
  requestSequenceRef: MutableRefObject<number>,
): (() => Promise<void>) => useCallback(async (): Promise<void> => {
  const sequence = ++requestSequenceRef.current;
  if (!options.account || !options.contract || !options.isEnabled) { setState(EMPTY_RECORDS); return; }
  setState((current) => ({ ...current, isLoading: true }));
  try {
    const response = await fetchEscrowRecords(options.account, options.contract);
    if (sequence !== requestSequenceRef.current) return;
    setState({
      records: response.records, recordCount: response.summary.recordCount,
      protectedValue: response.summary.protectedValue, isLoading: false,
    });
  } catch (loadError) {
    if (sequence !== requestSequenceRef.current) return;
    setState({ ...EMPTY_RECORDS, error: `Could not load escrow records: ${getFriendlyError(loadError)}` });
  }
}, [options.account, options.contract, options.isEnabled, requestSequenceRef, setState]);

export const useEscrowRecords = (
  account: Address | undefined,
  contract: Address | undefined,
  isEnabled: boolean,
): EscrowRecordsController => {
  const [state, setState] = useState<EscrowRecordsState>(EMPTY_RECORDS);
  const requestSequenceRef = useRef(0);
  const reload = useRecordLoader({ account, contract, isEnabled }, setState, requestSequenceRef);
  useLayoutEffect(() => {
    ++requestSequenceRef.current;
    const timeout = window.setTimeout(() => { void reload(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [reload]);
  return { ...state, reload };
};
