import { AppButton } from '../../../../core/widgets/AppButton';
import { AppBadge } from '../../../../core/widgets/AppBadge';
import type { TeamEmployee, TeamRole } from '../../models/Team';

const teamRoleLabel: Record<TeamRole, string> = {
  team_leader: 'Team Leader',
  member: 'Member',
};

interface TeamMemberListProps {
  employees: Record<string, TeamEmployee>;
  teamLeaderId: string;
  canManage: boolean;
  onRemove?: (userId: string) => void;
}

export function TeamMemberList({
  employees,
  teamLeaderId,
  canManage,
  onRemove,
}: TeamMemberListProps) {
  const entries = Object.entries(employees);

  if (entries.length === 0) {
    return <p className="text-sm text-content-muted">No members yet.</p>;
  }

  return (
    <div className="divide-y divide-surface-border">
      {entries.map(([uid, emp]) => (
        <div key={uid} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-content">{emp.name || uid}</p>
          </div>
          <AppBadge tone={uid === teamLeaderId ? 'accent' : 'neutral'}>
            {teamRoleLabel[emp.role] ?? emp.role}
          </AppBadge>
          {canManage && uid !== teamLeaderId && onRemove && (
            <AppButton variant="ghost" size="sm" onClick={() => onRemove(uid)}>
              Remove
            </AppButton>
          )}
        </div>
      ))}
    </div>
  );
}
