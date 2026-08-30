import Button from "./Button";
import Modal from "./Modal";

type ConfirmDialogProps = { open: boolean; title?: string; message: string; confirmLabel?: string; loading?: boolean; onConfirm: () => void; onCancel: () => void };

export default function ConfirmDialog({ open, title = "Confirm action", message, confirmLabel = "Confirm", loading, onConfirm, onCancel }: ConfirmDialogProps) {
  return <Modal open={open} onClose={onCancel} title={title}><p className="text-sm leading-6 text-[#6e6258]">{message}</p><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="button" variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button></div></Modal>;
}
