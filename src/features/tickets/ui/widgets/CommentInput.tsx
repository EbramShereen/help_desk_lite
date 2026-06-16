import { useState } from 'react';
import { AppButton } from '../../../../core/widgets/AppButton';

interface CommentInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
}

export function CommentInput({ onSubmit, isLoading }: CommentInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setMessage('');
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Add a comment…"
        className="h-9 flex-1 rounded-control border border-surface-border bg-surface px-3 text-sm text-content outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:shadow-focus"
      />
      <AppButton size="sm" onClick={handleSubmit} isLoading={isLoading} disabled={!message.trim()}>
        Send
      </AppButton>
    </div>
  );
}
