import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppTextField } from '../../../../core/widgets/AppTextField';
import { usePermissions } from '../../../auth/logic/usePermissions';
import { useQuoteController } from '../../logic/useQuoteController';
import {
  quoteInputSchema,
  type QuoteInput,
} from '../../../../core/data/models/request/quotes/quote_request';

export default function QuotesView() {
  const { t } = useTranslation();
  const { canAny } = usePermissions();
  const canManage = canAny('can_manage_quotes');
  const { quotes, quotesQuery, createQuote, deleteQuote, generateQuotes } = useQuoteController();
  const [count, setCount] = useState(10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteInputSchema),
    defaultValues: { text: '', author: '' },
  });

  const onAdd = handleSubmit((values) => {
    createQuote.mutate(values, { onSuccess: () => reset({ text: '', author: '' }) });
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-content">{t('quotes.title')}</h1>
        <p className="text-sm text-content-muted">{t('quotes.subtitle')}</p>
      </header>

      {canManage && (
        <AppCard className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <AppTextField
              type="number"
              min={1}
              max={30}
              label={t('quotes.generateCount')}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-32"
            />
            <AppButton
              variant="accent"
              onClick={() => generateQuotes.mutate(count)}
              isLoading={generateQuotes.isPending}
            >
              {t('quotes.generate')}
            </AppButton>
          </div>

          <form
            onSubmit={onAdd}
            className="flex flex-col gap-3 border-t border-surface-border pt-4"
          >
            <AppTextField
              label={t('quotes.text')}
              error={errors.text?.message}
              {...register('text')}
            />
            <AppTextField label={t('quotes.author')} {...register('author')} />
            <AppButton type="submit" isLoading={createQuote.isPending} className="self-start">
              {t('quotes.add')}
            </AppButton>
          </form>
        </AppCard>
      )}

      <section className="flex flex-col gap-3">
        {quotesQuery.isLoading && <p className="text-content-muted">{t('common.loading')}</p>}
        {!quotesQuery.isLoading && quotes.length === 0 && (
          <p className="text-content-muted">{t('quotes.empty')}</p>
        )}
        {quotes.map((quote) => (
          <AppCard key={quote.id} className="flex items-start justify-between gap-4 p-4">
            <p className="text-sm text-content">
              “{quote.text}”<span className="ml-2 text-content-muted">— {quote.author}</span>
            </p>
            {canManage && (
              <AppButton
                variant="danger"
                size="sm"
                onClick={() => deleteQuote.mutate(quote.id)}
                isLoading={deleteQuote.isPending}
              >
                {t('common.delete')}
              </AppButton>
            )}
          </AppCard>
        ))}
      </section>
    </div>
  );
}
