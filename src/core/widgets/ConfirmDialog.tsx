import { AppButton } from './AppButton';
import { cn } from '../../lib/cn';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-content/40" onClick={onCancel} />
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-card border border-surface-border bg-surface p-6 shadow-elevated',
        )}
      >
        <h3 className="text-lg font-semibold text-content">{title}</h3>
        <p className="mt-2 text-sm text-content-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <AppButton variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </AppButton>
          <AppButton variant="danger" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
