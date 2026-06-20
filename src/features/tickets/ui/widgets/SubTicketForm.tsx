import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppTextField } from '../../../../core/widgets/AppTextField';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { AppButton } from '../../../../core/widgets/AppButton';
import {
  subtaskSchema,
  type SubtaskInput,
} from '../../../../core/data/models/request/tickets/ticket_request';

interface SubTicketFormProps {
  teamMembers: { label: string; value: string }[];
  onSubmit: (data: SubtaskInput) => void;
  isLoading?: boolean;
}

export function SubTicketForm({ teamMembers, onSubmit, isLoading }: SubTicketFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubtaskInput>({
    resolver: zodResolver(subtaskSchema),
  });

  const submit = handleSubmit((data) => {
    onSubmit(data);
    reset();
  });

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 rounded-card border border-surface-border bg-surface-muted p-3"
    >
      <div className="min-w-[140px] flex-1">
        <AppTextField
          label={t('form.title')}
          error={errors.title?.message}
          {...register('title')}
        />
      </div>
      <div className="w-40">
        <AppDropdown
          label={t('filters.assignee')}
          placeholder={t('common.all')}
          error={errors.assigneeId?.message}
          options={teamMembers}
          {...register('assigneeId')}
        />
      </div>
      <AppButton type="submit" size="sm" isLoading={isLoading}>
        {t('common.create')}
      </AppButton>
    </form>
  );
}
