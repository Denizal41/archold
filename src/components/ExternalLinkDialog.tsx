import { ExternalLink, ShieldAlert } from "lucide-react";
import { ModalDialog } from "./ModalDialog";

interface ExternalLinkDialogProps {
  readonly href: string;
  onClose(): void;
}

export const ExternalLinkDialog = ({ href, onClose }: ExternalLinkDialogProps): React.JSX.Element => {
  const hostname = new URL(href).hostname;
  const handleOpen = (): void => {
    window.open(href, "_blank", "noopener,noreferrer");
    onClose();
  };
  return <ModalDialog titleId="external-link-title" onClose={onClose}>
    <section className="delivery-modal external-link-modal">
      <ShieldAlert size={22}/>
      <p className="eyebrow">EXTERNAL DELIVERY PROOF</p>
      <h2 id="external-link-title">Continue to {hostname}?</h2>
      <p>This content is controlled by the contractor. Never enter your wallet seed phrase or private key on an external site.</p>
      <div className="modal-actions"><button className="action-button secondary" onClick={onClose}>Cancel</button><button className="action-button" onClick={handleOpen}><ExternalLink size={14}/>Open proof</button></div>
    </section>
  </ModalDialog>;
};
