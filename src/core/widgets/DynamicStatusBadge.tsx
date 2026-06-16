import { cn } from '../../lib/cn';

/**
 * Status badge for admin-defined dynamic statuses. Colors come from data (not the
 * Tailwind palette), so they're applied via inline style with an alpha-tinted bg.
 */
export function DynamicStatusBadge({
  name,
  color,
  className,
}: {
  name: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold tracking-tight',
        className,
      )}
      style={{ color, backgroundColor: `${color}1F` }}
    >
      {name}
    </span>
  );
}
