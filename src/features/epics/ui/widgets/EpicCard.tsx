import { useNavigate } from 'react-router-dom';
import { cn } from '../../../../lib/cn';
import type { Epic } from '../../models/Epic';

interface EpicCardProps {
  epic: Epic;
  ticketCount?: number;
}

export function EpicCard({ epic, ticketCount }: EpicCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/epics/${epic.id}`)}
      className={cn(
        'flex cursor-pointer items-center gap-4 border-b border-surface-border px-4 py-3',
        'transition-colors duration-150 hover:bg-surface-muted',
      )}
    >
      {epic.color && (
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: epic.color }} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-content">{epic.title}</p>
        {epic.description && (
          <p className="mt-0.5 truncate text-xs text-content-muted">{epic.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {epic.teamIds.length > 0 && (
          <span className="text-xs text-content-muted">
            {epic.teamIds.length} team{epic.teamIds.length !== 1 ? 's' : ''}
          </span>
        )}
        {ticketCount !== undefined && (
          <span className="text-xs text-content-muted">
            {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
