import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { AppButton } from '../../../../core/widgets/AppButton';

interface AddMemberFormProps {
  availableUsers: { label: string; value: string }[];
  onAdd: (userId: string) => void;
  isLoading?: boolean;
}

export function AddMemberForm({ availableUsers, onAdd, isLoading }: AddMemberFormProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');

  if (availableUsers.length === 0) {
    return <p className="text-sm text-content-muted">No available users to add.</p>;
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <AppDropdown
          label={t('form.addMember')}
          placeholder="Select user"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          options={availableUsers}
        />
      </div>
      <AppButton
        size="sm"
        isLoading={isLoading}
        onClick={() => {
          if (selected) {
            onAdd(selected);
            setSelected('');
          }
        }}
      >
        {t('common.create')}
      </AppButton>
    </div>
  );
}
