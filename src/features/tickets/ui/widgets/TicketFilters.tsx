import { useTranslation } from 'react-i18next';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { AppButton } from '../../../../core/widgets/AppButton';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { setStatusFilter, setPriorityFilter, resetFilters } from '../../logic/ticketsSlice';
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  statusLabels,
  priorityLabels,
} from '../../models/Ticket';

export function TicketFilters() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { statusFilter, priorityFilter } = useAppSelector((s) => s.tickets);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <AppDropdown
        label={t('filters.status')}
        placeholder={t('common.all')}
        value={statusFilter ?? ''}
        onChange={(e) => dispatch(setStatusFilter((e.target.value as typeof statusFilter) || null))}
        options={TICKET_STATUSES.map((s) => ({ label: statusLabels[s], value: s }))}
      />
      <AppDropdown
        label={t('filters.priority')}
        placeholder={t('common.all')}
        value={priorityFilter ?? ''}
        onChange={(e) =>
          dispatch(setPriorityFilter((e.target.value as typeof priorityFilter) || null))
        }
        options={TICKET_PRIORITIES.map((p) => ({ label: priorityLabels[p], value: p }))}
      />
      <AppButton variant="ghost" size="sm" onClick={() => dispatch(resetFilters())}>
        {t('common.reset')}
      </AppButton>
    </div>
  );
}
