import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { QuoteRepo } from './QuoteRepo';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';
import { quoteFromDoc, type Quote } from '../../../core/data/models/response/quotes/quote_response';
import {
  quoteToDoc,
  type QuoteInput,
} from '../../../core/data/models/request/quotes/quote_request';

const QUOTES = 'quotes';

export class QuoteRepoImpl implements QuoteRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listQuotes(): Promise<Result<AppError, MultipleResult<Quote>>> {
    return guard(async () =>
      toMultipleResult((await this.ds.getCollection(QUOTES)).map(quoteFromDoc)),
    );
  }

  createQuote(input: QuoteInput): Promise<Result<AppError, Quote>> {
    return guard(async () => {
      const data = quoteToDoc(input);
      const id = await this.ds.addDocument(QUOTES, data);
      return quoteFromDoc({ id, ...data });
    });
  }

  createManyQuotes(inputs: QuoteInput[]): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await Promise.all(inputs.map((input) => this.ds.addDocument(QUOTES, quoteToDoc(input))));
      return success;
    });
  }

  deleteQuote(id: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.deleteDocument(QUOTES, id);
      return success;
    });
  }
}
