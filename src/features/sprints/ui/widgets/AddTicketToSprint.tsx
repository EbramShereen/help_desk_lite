import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { AppButton } from '../../../../core/widgets/AppButton';

interface AddTicketToSprintProps {
  availableTickets: { label: string; value: string; assigneeIds: string[] }[];
  onAdd: (ticketId: string, assigneeIds: string[]) => void;
  isLoading?: boolean;
}

export function AddTicketToSprint({ availableTickets, onAdd, isLoading }: AddTicketToSprintProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');

  if (availableTickets.length === 0) {
    return <p className="text-sm text-content-muted">No unassigned tickets available.</p>;
  }

  const options = availableTickets.map((t) => ({ label: t.label, value: t.value }));

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <AppDropdown
          label={t('form.addTicket')}
          placeholder="Select ticket"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          options={options}
        />
      </div>
      <AppButton
        size="sm"
        isLoading={isLoading}
        onClick={() => {
          if (!selected) return;
          const ticket = availableTickets.find((t) => t.value === selected);
          if (ticket) {
            onAdd(ticket.value, ticket.assigneeIds);
            setSelected('');
          }
        }}
      >
        {t('common.create')}
      </AppButton>
    </div>
  );
}
