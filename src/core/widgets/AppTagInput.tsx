import { useState, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';

interface AppTagInputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value: string[];
  onChange: (tags: string[]) => void;
}

export function AppTagInput({ label, error, placeholder, value, onChange }: AppTagInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-label text-content-muted">
          {label}
        </span>
      )}
      <div
        className={cn(
          'flex min-h-[2.75rem] w-full flex-wrap items-center gap-1.5 rounded-control border bg-surface px-3.5 py-2',
          error
            ? 'border-danger'
            : 'border-surface-border focus-within:border-primary focus-within:shadow-focus',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-pill bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-content-muted hover:text-danger"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? (placeholder ?? 'Add tag…') : ''}
          className="min-w-[60px] flex-1 bg-transparent text-sm text-content outline-none"
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
