import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface ModalDialogProps {
  readonly titleId: string;
  readonly children: ReactNode;
  onClose(): void;
}

export const ModalDialog = ({ titleId, children, onClose }: ModalDialogProps): React.JSX.Element => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  return <dialog
    ref={dialogRef}
    className="modal-dialog"
    aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
  >{children}</dialog>;
};
