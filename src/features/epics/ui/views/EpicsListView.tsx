import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEpicController } from '../../logic/useEpicController';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppCard } from '../../../../core/widgets/AppCard';
import { EpicCard } from '../widgets/EpicCard';
import { usePermissions } from '../../../auth/logic/usePermissions';

export default function EpicsListView() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { epicsQuery } = useEpicController();
  const epics = useMemo(() => epicsQuery.data ?? [], [epicsQuery.data]);

  const canCreate = can('can_create_epic');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">Epics</h1>
        {canCreate && <AppButton onClick={() => navigate('/epics/new')}>New Epic</AppButton>}
      </div>

      <AppCard className="overflow-hidden !p-0">
        {epicsQuery.isLoading && <p className="p-6 text-sm text-content-muted">Loading epics…</p>}
        {epicsQuery.isError && <p className="p-6 text-sm text-danger">Failed to load epics.</p>}
        {!epicsQuery.isLoading && epics.length === 0 && (
          <p className="p-6 text-sm text-content-muted">No epics found.</p>
        )}
        {epics.map((e) => (
          <EpicCard key={e.id} epic={e} />
        ))}
      </AppCard>
    </div>
  );
}
