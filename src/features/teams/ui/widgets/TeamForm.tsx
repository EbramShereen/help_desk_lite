import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppTextField } from '../../../../core/widgets/AppTextField';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { AppMultiSelect } from '../../../../core/widgets/AppMultiSelect';
import { AppButton } from '../../../../core/widgets/AppButton';
import { teamInputSchema, type TeamInput } from '../../models/Team';

interface TeamFormProps {
  leaderOptions: { label: string; value: string }[];
  memberOptions: { label: string; value: string }[];
  onSubmit: (data: TeamInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<TeamInput>;
}

export function TeamForm({
  leaderOptions,
  memberOptions,
  onSubmit,
  isLoading,
  defaultValues,
}: TeamFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TeamInput>({
    resolver: zodResolver(teamInputSchema),
    defaultValues: { memberIds: [], ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <AppTextField
        label={t('form.teamName')}
        error={errors.label?.message}
        {...register('label')}
      />
      <AppDropdown
        label={t('form.teamLeader')}
        placeholder={t('form.selectLeader')}
        error={errors.teamLeaderId?.message}
        options={leaderOptions}
        {...register('teamLeaderId')}
      />
      <Controller
        name="memberIds"
        control={control}
        render={({ field }) => (
          <AppMultiSelect
            label={t('form.members')}
            placeholder={t('form.selectMembers')}
            error={errors.memberIds?.message}
            options={memberOptions}
            value={field.value ?? []}
            onChange={field.onChange}
          />
        )}
      />
      <div className="flex justify-end">
        <AppButton type="submit" isLoading={isLoading}>
          {t('form.saveTeam')}
        </AppButton>
      </div>
    </form>
  );
}
