import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Team } from '../../../teams/models/Team';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { AppBadge } from '../../../../core/widgets/AppBadge';

interface EpicTeamManagerProps {
  assignedTeams: Team[];
  allTeams: Team[];
  onAssign: (teamIds: string[]) => void;
  onRemove: (teamId: string) => void;
  isLoading: boolean;
}

export function EpicTeamManager({
  assignedTeams,
  allTeams,
  onAssign,
  onRemove,
  isLoading,
}: EpicTeamManagerProps) {
  const { t } = useTranslation();
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const assignedIds = new Set(assignedTeams.map((t) => t.id));
  const available = allTeams.filter((t) => !assignedIds.has(t.id));

  const handleAssign = () => {
    if (!selectedTeamId) return;
    onAssign([selectedTeamId]);
    setSelectedTeamId('');
  };

  return (
    <AppCard>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-label text-content-muted">
        Teams
      </h3>

      {assignedTeams.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {assignedTeams.map((team) => (
            <AppBadge key={team.id} tone="info">
              <span className="flex items-center gap-1.5">
                {team.label}
                <button
                  type="button"
                  onClick={() => onRemove(team.id)}
                  disabled={isLoading}
                  className="ml-1 text-xs opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            </AppBadge>
          ))}
        </div>
      )}

      {available.length > 0 && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <AppDropdown
              label={t('form.addTeam')}
              placeholder="Select a team"
              options={available.map((t) => ({ label: t.label, value: t.id }))}
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            />
          </div>
          <AppButton
            size="sm"
            onClick={handleAssign}
            isLoading={isLoading}
            disabled={!selectedTeamId}
          >
            Assign
          </AppButton>
        </div>
      )}

      {assignedTeams.length === 0 && available.length === 0 && (
        <p className="text-sm text-content-muted">No teams available.</p>
      )}
    </AppCard>
  );
}
