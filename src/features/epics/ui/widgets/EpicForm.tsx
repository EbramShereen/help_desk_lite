import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppTextField } from '../../../../core/widgets/AppTextField';
import { AppTextArea } from '../../../../core/widgets/AppTextArea';
import { AppButton } from '../../../../core/widgets/AppButton';
import { epicInputSchema, type EpicInput } from '../../models/Epic';

interface EpicFormProps {
  onSubmit: (data: EpicInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<EpicInput>;
}

export function EpicForm({ onSubmit, isLoading, defaultValues }: EpicFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EpicInput>({
    resolver: zodResolver(epicInputSchema),
    defaultValues: { color: '#6366f1', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <AppTextField label={t('form.title')} error={errors.title?.message} {...register('title')} />
      <AppTextArea
        label={t('form.description')}
        error={errors.description?.message}
        {...register('description')}
      />
      <Controller
        name="color"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content">{t('form.color')}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={field.value ?? '#6366f1'}
                onChange={field.onChange}
                className="h-10 w-14 cursor-pointer rounded-control border border-surface-border bg-surface"
              />
              <span className="text-sm text-content-muted">{field.value ?? '#6366f1'}</span>
            </div>
          </div>
        )}
      />
      <div className="flex justify-end">
        <AppButton type="submit" isLoading={isLoading}>
          {t('form.saveEpic')}
        </AppButton>
      </div>
    </form>
  );
}
