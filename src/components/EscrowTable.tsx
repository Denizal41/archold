import { ArrowUpRight, Clock3, Copy, LoaderCircle, MoveRight, RotateCcw, Send, UnlockKeyhole } from "lucide-react";
import { ARC_EXPLORER } from "../arc";
import { formatBalance, formatDeadline, formatTimeRemaining, shortenAddress } from "../utils/format";
import { getProofHref } from "../utils/proofLink";
import type { Address } from "viem";
import type { ReactNode } from "react";
import type { EscrowRecord, EscrowStatus, SettlementAction } from "../types/escrow";

const STATUS_LABELS: Record<EscrowStatus, string> = {
  0: "Protected",
  1: "Delivered",
  2: "Released",
  3: "Refunded",
};

interface ActionProps {
  readonly record: EscrowRecord;
  readonly isPayer: boolean;
  readonly isBusy: boolean;
  readonly now: number;
  onDeliver(record: EscrowRecord): void;
  onSettle(record: EscrowRecord, action: SettlementAction): void;
}

const ContractorActions = (props: ActionProps): React.JSX.Element => {
  const isExpired = props.now > Number(props.record.deadline);
  const isClaimable = props.now >= Number(props.record.claimableAt);
  return <>
    {props.record.status === 0 && !isExpired && <button className="action-button" disabled={props.isBusy} onClick={() => props.onDeliver(props.record)}><Send size={14}/>Submit delivery</button>}
    {props.record.status === 1 && isClaimable && <button className="action-button" disabled={props.isBusy} onClick={() => props.onSettle(props.record, "claim")}><UnlockKeyhole size={14}/>Claim payment</button>}
    {props.record.status === 1 && !isClaimable && <span className="awaiting">Payer review</span>}
    <button className="action-button secondary" disabled={props.isBusy} onClick={() => props.onSettle(props.record, "refund")}><RotateCcw size={14}/>Return</button>
  </>;
};

const PayerActions = (props: ActionProps): React.JSX.Element => {
  const isExpired = props.now > Number(props.record.deadline);
  if (props.record.status === 1) return <button className="action-button" disabled={props.isBusy} onClick={() => props.onSettle(props.record, "release")}><UnlockKeyhole size={14}/>Release</button>;
  if (isExpired) return <button className="action-button secondary" disabled={props.isBusy} onClick={() => props.onSettle(props.record, "refund")}><RotateCcw size={14}/>Refund</button>;
  return <span className="awaiting">Awaiting delivery</span>;
};

const RowActions = (props: ActionProps): React.JSX.Element => {
  const isActive = props.record.status === 0 || props.record.status === 1;
  if (!isActive) return <a className="explorer-link" href={ARC_EXPLORER} target="_blank" rel="noreferrer">ArcScan <ArrowUpRight size={12}/></a>;
  return <div className="row-actions">{props.isPayer ? <PayerActions {...props}/> : <ContractorActions {...props}/>}</div>;
};

interface EscrowRowProps extends Omit<ActionProps, "isPayer"> {
  readonly address: Address;
  onOpenProof(href: string): void;
}

const getTimingLabel = (record: EscrowRecord, now: number): string => {
  if (record.status === 0) return formatTimeRemaining(record.deadline, now);
  if (record.status === 1) return `Review: ${formatTimeRemaining(record.claimableAt, now)}`;
  return "";
};

const EscrowRow = (props: EscrowRowProps): React.JSX.Element => {
  const { record } = props;
  const isPayer = props.address.toLowerCase() === record.payer.toLowerCase();
  const counterparty = isPayer ? record.payee : record.payer;
  const proofHref = getProofHref(record.proofUri);
  return <tr>
    <td><strong>{record.description}</strong><small>#{record.id.toString()}{proofHref && <> · <button className="proof-link" onClick={() => props.onOpenProof(proofHref)}>delivery proof <ArrowUpRight size={10}/></button></>}</small></td>
    <td><button className="address-copy" onClick={() => void navigator.clipboard.writeText(counterparty)}>{shortenAddress(counterparty)} <Copy size={13}/></button></td>
    <td>{formatBalance(record.amount, 6)} USDC</td>
    <td>{formatDeadline(record.deadline)}<small>{getTimingLabel(record, props.now)}</small></td>
    <td><span className={`tag status-${record.status}`}><Clock3 size={13}/>{STATUS_LABELS[record.status]}</span></td>
    <td><RowActions record={record} isPayer={isPayer} isBusy={props.isBusy} now={props.now} onDeliver={props.onDeliver} onSettle={props.onSettle}/></td>
  </tr>;
};

interface EscrowTableProps {
  readonly address?: Address;
  readonly contract?: Address;
  readonly records: readonly EscrowRecord[];
  readonly recordCount: number;
  readonly isLoading: boolean;
  readonly isBusy: boolean;
  readonly now: number;
  onDeliver(record: EscrowRecord): void;
  onOpenProof(href: string): void;
  onSettle(record: EscrowRecord, action: SettlementAction): void;
}

const getCountLabel = (visible: number, total: number): string =>
  total > visible ? `Latest ${visible} of ${total} records` : `${visible} ${visible === 1 ? "record" : "records"}`;

const getEmptyMessage = (address?: Address, contract?: Address): string => {
  if (!address) return "Connect a wallet to view your escrows.";
  return contract ? "No escrows for this wallet yet." : "V3 contract deployment pending.";
};

const renderRecords = (props: EscrowTableProps): ReactNode => {
  if (!props.address) return null;
  const address = props.address;
  return props.records.map((record) => <EscrowRow
    key={record.id.toString()} address={address} record={record}
    isBusy={props.isBusy} now={props.now} onDeliver={props.onDeliver}
    onOpenProof={props.onOpenProof} onSettle={props.onSettle}
  />);
};

export const EscrowTable = (props: EscrowTableProps): React.JSX.Element => (
  <section className="ledger">
    <div className="ledger-head"><div><p className="eyebrow">ONCHAIN WORKSPACE</p><h2>Escrow records</h2></div><span>{getCountLabel(props.records.length, props.recordCount)}</span></div>
    <p className="table-swipe">Swipe to view actions <MoveRight size={14}/></p>
    <div className="table-wrap"><table><thead><tr><th>JOB</th><th>COUNTERPARTY</th><th>AMOUNT</th><th>DEADLINE</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
      {props.isLoading && <tr><td colSpan={6} className="empty-row"><LoaderCircle className="spin" size={16}/> Loading onchain records…</td></tr>}
      {!props.isLoading && renderRecords(props)}
      {!props.isLoading && props.records.length === 0 && <tr><td colSpan={6} className="empty-row">{getEmptyMessage(props.address, props.contract)}</td></tr>}
    </tbody></table></div>
  </section>
);
