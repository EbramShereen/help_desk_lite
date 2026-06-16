import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface AppMultiSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (selected: string[]) => void;
}

export function AppMultiSelect({
  label,
  error,
  placeholder,
  options,
  value,
  onChange,
}: AppMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (optValue: string) => {
    onChange(value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue]);
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <div className="flex w-full flex-col gap-2" ref={ref}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-label text-content-muted">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex min-h-[2.75rem] w-full flex-wrap items-center gap-1.5 rounded-control border bg-surface px-3.5 py-2 text-left text-sm outline-none',
          'transition-[border-color,box-shadow] duration-200',
          error ? 'border-danger' : 'border-surface-border focus:border-primary focus:shadow-focus',
        )}
        aria-invalid={!!error}
      >
        {selectedLabels.length > 0 ? (
          selectedLabels.map((lbl, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-pill bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary"
            >
              {lbl}
            </span>
          ))
        ) : (
          <span className="text-content-subtle">{placeholder ?? 'Select…'}</span>
        )}
      </button>
      {open && (
        <div className="relative z-10 -mt-1 max-h-48 overflow-y-auto rounded-control border border-surface-border bg-surface shadow-elevated">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm hover:bg-surface-muted"
            >
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-4 w-4 rounded accent-primary"
              />
              {opt.label}
            </label>
          ))}
          {options.length === 0 && (
            <p className="px-3.5 py-2 text-sm text-content-muted">No options available</p>
          )}
        </div>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
