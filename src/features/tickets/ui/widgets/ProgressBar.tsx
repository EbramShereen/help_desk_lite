import { cn } from '../../../../lib/cn';

export function ProgressBar({ progress, className }: { progress: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-muted">
        <div
          className="bg-status-completed h-full rounded-pill transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-content-muted">{progress}%</span>
    </div>
  );
}
