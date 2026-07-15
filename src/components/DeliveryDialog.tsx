import { Link2 } from "lucide-react";
import { useState } from "react";
import { ModalDialog } from "./ModalDialog";
import type { EscrowRecord } from "../types/escrow";

interface DeliveryDialogProps {
  readonly record: EscrowRecord;
  readonly isBusy: boolean;
  onClose(): void;
  onSubmit(record: EscrowRecord, proofUri: string): Promise<boolean>;
}

export const DeliveryDialog = ({ record, isBusy, onClose, onSubmit }: DeliveryDialogProps): React.JSX.Element => {
  const [proofUri, setProofUri] = useState("");
  const handleSubmit = async (): Promise<void> => {
    if (await onSubmit(record, proofUri)) onClose();
  };
  return <ModalDialog titleId="delivery-title" onClose={onClose}>
    <section className="delivery-modal">
      <p className="eyebrow">ONCHAIN DELIVERY</p>
      <h2 id="delivery-title">Submit proof of work</h2>
      <p>Add a public HTTPS or IPFS link. It is permanently anchored to this milestone and cannot be replaced.</p>
      <label>Delivery proof URL<input autoFocus maxLength={240} value={proofUri} onChange={(event) => setProofUri(event.target.value)} placeholder="https://github.com/… or ipfs://…" /></label>
      <div className="modal-actions"><button className="action-button secondary" onClick={onClose}>Cancel</button><button className="action-button" disabled={isBusy} onClick={() => void handleSubmit()}><Link2 size={14}/>{isBusy ? "Confirming…" : "Submit onchain"}</button></div>
    </section>
  </ModalDialog>;
};
