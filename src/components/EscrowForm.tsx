import { LockKeyhole, LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import type { CreateEscrowInput, Notice } from "../types/escrow";
import { NoticeMessage } from "./NoticeMessage";

const DAY_IN_MS = 86_400_000;
const DEFAULT_AMOUNT = "25";
const DEFAULT_TITLE = "Landing page delivery";
const getDefaultDeadline = (): string => new Date(Date.now() + 7 * DAY_IN_MS).toISOString().slice(0, 10);

interface EscrowFormProps {
  readonly isBusy: boolean;
  readonly notice?: Notice;
  onCreate(input: CreateEscrowInput): Promise<void>;
}

export const EscrowForm = ({ isBusy, notice, onCreate }: EscrowFormProps): React.JSX.Element => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [deadline, setDeadline] = useState(getDefaultDeadline);
  const handleSubmit = async (): Promise<void> => onCreate({ recipient, amount, title, deadline });

  return <div className="fund-panel">
    <div className="panel-title"><div><p className="eyebrow">NEW ESCROW</p><h2>Fund the work. Release on delivery.</h2></div><LockKeyhole size={22}/></div>
    <label>Job title<input maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Landing page delivery" /></label>
    <label>Contractor wallet address<input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x…" spellCheck="false" /></label>
    <div className="form-row">
      <label>Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" /><small>ERC-20 USDC · 6 decimals</small></label>
      <label>Delivery deadline<input type="date" min={new Date().toISOString().slice(0, 10)} value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
    </div>
    <button className="primary" disabled={isBusy} onClick={() => void handleSubmit()}>{isBusy ? <><LoaderCircle className="spin" size={18}/> Confirming onchain…</> : <><Plus size={18}/> Create escrow</>}</button>
    <NoticeMessage notice={notice}/>
  </div>;
};
