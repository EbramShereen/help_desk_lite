import { cn } from '../../lib/cn';

export interface ColorPickerProps {
  label?: string;
  value: string | null;
  onChange: (color: string | null) => void;
  /** Preset swatches to offer alongside the freeform picker. */
  presets?: string[];
  className?: string;
}

const DEFAULT_PRESETS = ['#14213D', '#C9A86A', '#2563EB', '#059669', '#B4232A', '#9A7B3F'];

/** Color override picker with preset swatches and a native color input. */
export function ColorPicker({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="text-sm font-medium text-content">{label}</span>}
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Use ${c}`}
            onClick={() => onChange(c)}
            className={cn(
              'h-7 w-7 rounded-pill border-2 transition-transform hover:scale-110',
              'focus-visible:shadow-focus focus-visible:outline-none',
              value === c ? 'border-content' : 'border-surface-border',
            )}
            style={{ backgroundColor: c }}
          />
        ))}
        <input
          type="color"
          value={value ?? '#14213D'}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded-control border border-surface-border bg-surface"
          aria-label="Custom color"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-medium text-content-muted hover:text-content"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
