import type { Quote } from '../../../core/data/models/response/quotes/quote_response';
import type { QuoteInput } from '../../../core/data/models/request/quotes/quote_request';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

/**
 * Workspace quotes, nested under `users/{ownerId}/quotes`. Persisted through
 * AppDataSource — no direct Firebase access.
 */
export interface QuoteRepo {
  listQuotes(): Promise<Result<AppError, MultipleResult<Quote>>>;
  createQuote(input: QuoteInput): Promise<Result<AppError, Quote>>;
  createManyQuotes(inputs: QuoteInput[]): Promise<Result<AppError, SuccessResult>>;
  deleteQuote(id: string): Promise<Result<AppError, SuccessResult>>;
}
