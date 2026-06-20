import { AppError } from '../errors/AppError';

/**
 * Sealed Result type: holds EITHER an error `E` or a success `S`.
 * Port of the Dart `Result<E, S>` sealed class.
 *
 * Usage: `Result<AppError, Ticket[]>` — error type first, data type second.
 * Construct with `new Success(value)` / `new Failure(error)`.
 */
export abstract class Result<E, S> {
  /** Raw held value (error or success). Prefer the typed getters. */
  abstract get(): E | S;

  /** Returns the success value, or undefined if this is a failure. */
  abstract getSuccess(): S | undefined;

  /** Returns the error value, or undefined if this is a success. */
  abstract getError(): E | undefined;

  /** True when this is a failure. */
  abstract isError(): boolean;

  /** True when this is a success. */
  abstract isSuccess(): boolean;

  /**
   * Collapse to a single value: `whenError` runs for a failure,
   * `whenSuccess` runs for a success.
   */
  abstract when<W>(whenError: (error: E) => W, whenSuccess: (success: S) => W): W;
}

/** Success branch — returned when the result is the expected value. */
export class Success<E, S> extends Result<E, S> {
  private readonly _success: S;

  constructor(success: S) {
    super();
    this._success = success;
  }

  get(): S {
    return this._success;
  }

  isError(): boolean {
    return false;
  }

  isSuccess(): boolean {
    return true;
  }

  getError(): E | undefined {
    return undefined;
  }

  getSuccess(): S | undefined {
    return this._success;
  }

  when<W>(_whenError: (error: E) => W, whenSuccess: (success: S) => W): W {
    return whenSuccess(this._success);
  }
}

/** Failure branch — returned when the result is not the expected value. */
export class Failure<E, S> extends Result<E, S> {
  private readonly _error: E;

  constructor(error: E) {
    super();
    this._error = error;
  }

  get(): E {
    return this._error;
  }

  isError(): boolean {
    return true;
  }

  isSuccess(): boolean {
    return false;
  }

  getError(): E | undefined {
    return this._error;
  }

  getSuccess(): S | undefined {
    return undefined;
  }

  when<W>(whenError: (error: E) => W): W {
    return whenError(this._error);
  }
}

/**
 * Repo helper: run an async datasource call, wrapping the outcome in a Result.
 * The datasource already maps vendor errors to AppError (see CLAUDE rules), so a
 * thrown AppError is captured as-is; anything else maps to AppError.unknown.
 */
export async function guard<S>(fn: () => Promise<S>): Promise<Result<AppError, S>> {
  try {
    return new Success(await fn());
  } catch (e) {
    return new Failure(e instanceof AppError ? e : AppError.unknown(e));
  }
}

/**
 * Controller helper: unwrap a repo Result for React Query. Throws the AppError
 * on failure (so `isError`/`error`/retry work) and returns the value on success.
 */
export async function unwrap<S>(result: Promise<Result<AppError, S>>): Promise<S> {
  const r = await result;
  if (r.isError()) throw r.getError();
  return r.getSuccess() as S;
}

/**
 * Default success payload. Use `Result<AppError, SuccessResult>` instead of
 * `Result<AppError, void>` for operations with no return value.
 */
export class SuccessResult {
  private constructor() {}
  static readonly instance = new SuccessResult();
}

/** Default success case singleton. */
export const success = SuccessResult.instance;
