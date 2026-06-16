import { cn } from '../../lib/cn';

export interface AvatarPerson {
  id: string;
  name: string;
  photoUrl?: string | null;
}

export interface AvatarStackProps {
  people: AvatarPerson[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-[0.625rem]',
  md: 'h-8 w-8 text-xs',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

/** Overlapping assignee avatars with a "+N" overflow chip. */
export function AvatarStack({ people, max = 4, size = 'md', className }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {shown.map((p) => (
        <span
          key={p.id}
          title={p.name}
          className={cn(
            'inline-flex items-center justify-center rounded-pill border-2 border-surface bg-primary-subtle font-semibold text-primary',
            sizeClasses[size],
          )}
        >
          {p.photoUrl ? (
            <img
              src={p.photoUrl}
              alt={p.name}
              className="h-full w-full rounded-pill object-cover"
            />
          ) : (
            initials(p.name)
          )}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-pill border-2 border-surface bg-surface-muted font-semibold text-content-muted',
            sizeClasses[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
