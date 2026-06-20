import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextField } from '../../../../core/widgets/AppTextField';
import { AppTextArea } from '../../../../core/widgets/AppTextArea';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { AppDatePicker } from '../../../../core/widgets/AppDatePicker';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppMultiSelect } from '../../../../core/widgets/AppMultiSelect';
import { AppTagInput } from '../../../../core/widgets/AppTagInput';
import { TICKET_PRIORITIES } from '../../../../core/enums/tickets/ticket_priority';
import { TICKET_STATUSES } from '../../../../core/enums/tickets/ticket_status';
import {
  statusLabels,
  priorityLabels,
} from '../../../../core/data/models/response/tickets/ticket_response';
import type { TicketInput } from '../../../../core/data/models/request/tickets/ticket_request';

const ticketFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
  assigneeIds: z.array(z.string()).min(1, 'At least one assignee is required'),
  teamId: z.string().min(1, 'Team is required'),
  epicId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.enum(TICKET_PRIORITIES),
  status: z.enum(TICKET_STATUSES),
});
type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  teamMembers: { label: string; value: string }[];
  teamId: string;
  onSubmit: (data: TicketInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<TicketInput>;
  epicOptions?: { label: string; value: string }[];
  sprintOptions?: { label: string; value: string }[];
}

export function TicketForm({
  teamMembers,
  teamId,
  onSubmit,
  isLoading,
  defaultValues,
  epicOptions,
  sprintOptions,
}: TicketFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      status: defaultValues?.status ?? 'todo',
      priority: defaultValues?.priority ?? 'medium',
      teamId,
      assigneeIds: defaultValues?.assigneeIds ?? [],
      labels: defaultValues?.labels ?? [],
      epicId: defaultValues?.epicId ?? null,
      sprintId: defaultValues?.sprintId ?? null,
      title: defaultValues?.title,
      description: defaultValues?.description,
    },
  });

  const submit = handleSubmit((data) => {
    onSubmit({
      ...data,
      startDate: new Date(data.startDate).getTime(),
      deadline: new Date(data.deadline).getTime(),
      teamId,
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <AppTextField
            label={t('form.title')}
            error={errors.title?.message}
            {...register('title')}
          />
        </div>
        <div className="md:col-span-2">
          <AppTextArea
            label={t('form.description')}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <Controller
          name="assigneeIds"
          control={control}
          render={({ field }) => (
            <AppMultiSelect
              label={t('form.assignees')}
              placeholder={t('form.selectAssignees')}
              error={errors.assigneeIds?.message}
              options={teamMembers}
              value={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />

        <AppDropdown
          label={t('form.priority')}
          error={errors.priority?.message}
          options={TICKET_PRIORITIES.map((p) => ({ label: priorityLabels[p], value: p }))}
          {...register('priority')}
        />
        <AppDropdown
          label={t('form.status')}
          error={errors.status?.message}
          options={TICKET_STATUSES.map((s) => ({ label: statusLabels[s], value: s }))}
          {...register('status')}
        />

        {epicOptions && epicOptions.length > 0 && (
          <AppDropdown
            label={t('form.epic')}
            placeholder={t('form.noEpic')}
            options={epicOptions}
            {...register('epicId')}
          />
        )}

        {sprintOptions && sprintOptions.length > 0 && (
          <AppDropdown
            label={t('form.sprint')}
            placeholder={t('form.noSprint')}
            options={sprintOptions}
            {...register('sprintId')}
          />
        )}

        <AppDatePicker
          label={t('form.startDate')}
          error={errors.startDate?.message}
          {...register('startDate')}
        />
        <AppDatePicker
          label={t('form.deadline')}
          error={errors.deadline?.message}
          {...register('deadline')}
        />

        <div className="md:col-span-2">
          <Controller
            name="labels"
            control={control}
            render={({ field }) => (
              <AppTagInput
                label={t('form.labels')}
                placeholder={t('form.tagsPlaceholder')}
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <AppButton type="submit" isLoading={isLoading}>
          {t('form.saveTicket')}
        </AppButton>
      </div>
    </form>
  );
}
