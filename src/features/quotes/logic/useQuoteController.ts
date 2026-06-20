import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { unwrap } from '../../../core/models/Result';
import type { Quote } from '../../../core/data/models/response/quotes/quote_response';
import type { QuoteInput } from '../../../core/data/models/request/quotes/quote_request';
import { fetchRandomQuotes } from './quoteSource';

const QUOTES_KEY = 'quotes';

/** Picks one random quote from a list, or null when empty. */
export function randomQuote(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) return null;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Logic hook for workspace quotes. Read by the global QuoteBanner (every page)
 * and managed in QuotesView by users with `can_manage_quotes`.
 */
export function useQuoteController() {
  const repo = useInjected(TOKENS.QuoteRepo);
  const qc = useQueryClient();

  const quotesQuery = useQuery({
    queryKey: [QUOTES_KEY],
    queryFn: () => unwrap(repo.listQuotes()),
    select: (result) => result.items,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [QUOTES_KEY] });

  const createQuote = useMutation({
    mutationFn: (input: QuoteInput) => unwrap(repo.createQuote(input)),
    onSuccess: invalidate,
  });
  const deleteQuote = useMutation({
    mutationFn: (id: string) => unwrap(repo.deleteQuote(id)),
    onSuccess: invalidate,
  });
  const generateQuotes = useMutation({
    mutationFn: async (count: number) => {
      const inputs = await fetchRandomQuotes(count);
      return unwrap(repo.createManyQuotes(inputs));
    },
    onSuccess: invalidate,
  });

  return {
    quotes: quotesQuery.data ?? [],
    quotesQuery,
    createQuote,
    deleteQuote,
    generateQuotes,
  };
}
