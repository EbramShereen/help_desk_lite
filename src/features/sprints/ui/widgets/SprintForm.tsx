import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextField } from '../../../../core/widgets/AppTextField';
import { AppDatePicker } from '../../../../core/widgets/AppDatePicker';
import { AppButton } from '../../../../core/widgets/AppButton';
import type { SprintInput } from '../../models/Sprint';

const sprintFormSchema = z.object({
  name: z.string().min(3, 'Sprint name must be at least 3 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  teamId: z.string().min(1, 'Team is required'),
});
type SprintFormValues = z.infer<typeof sprintFormSchema>;

interface SprintFormProps {
  teamId: string;
  onSubmit: (data: SprintInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<SprintInput>;
}

export function SprintForm({ teamId, onSubmit, isLoading, defaultValues }: SprintFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: { teamId, name: defaultValues?.name },
  });

  const submit = handleSubmit((data) => {
    onSubmit({
      name: data.name,
      startDate: new Date(data.startDate).getTime(),
      endDate: new Date(data.endDate).getTime(),
      teamId,
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <AppTextField
        label={t('form.sprintName')}
        error={errors.name?.message}
        {...register('name')}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AppDatePicker
          label={t('form.startDate')}
          error={errors.startDate?.message}
          {...register('startDate')}
        />
        <AppDatePicker
          label={t('form.endDate')}
          error={errors.endDate?.message}
          {...register('endDate')}
        />
      </div>
      <div className="flex justify-end">
        <AppButton type="submit" isLoading={isLoading}>
          {t('form.saveSprint')}
        </AppButton>
      </div>
    </form>
  );
}
