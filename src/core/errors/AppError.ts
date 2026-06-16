/** Categories let the UI react generically (toast vs inline vs redirect). */
export type AppErrorKind =
  | 'auth'
  | 'permission'
  | 'not-found'
  | 'network'
  | 'validation'
  | 'unavailable'
  | 'unknown';

/**
 * Normalized application error. Every layer throws/propagates this instead of
 * raw Firebase/SDK errors, so the UI never deals with vendor-specific shapes.
 */
export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly code: string;
  readonly cause?: unknown;

  constructor(params: { kind: AppErrorKind; code: string; message: string; cause?: unknown }) {
    super(params.message);
    this.name = 'AppError';
    this.kind = params.kind;
    this.code = params.code;
    this.cause = params.cause;
  }

  static unknown(cause?: unknown): AppError {
    return new AppError({
      kind: 'unknown',
      code: 'unknown',
      message: 'Something went wrong. Please try again.',
      cause,
    });
  }
}
