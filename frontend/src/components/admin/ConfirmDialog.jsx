import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal';
import { Spinner } from '../ui';

export default function ConfirmDialog({ open, title = 'Are you sure?', message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      size="sm"
      footer={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>{busy && <Spinner className="h-4 w-4" />} {confirmLabel}</button>
        </>
      )}
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
        <p className="text-sm leading-relaxed text-muted">{message}</p>
      </div>
    </Modal>
  );
}
