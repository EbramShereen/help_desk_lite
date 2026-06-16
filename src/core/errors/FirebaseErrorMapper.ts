import { FirebaseError } from 'firebase/app';
import { AppError, type AppErrorKind } from './AppError';

/** Maps Firebase Auth + Firestore error codes to friendly AppErrors. */
const codeMap: Record<string, { kind: AppErrorKind; message: string }> = {
  // Auth
  'auth/invalid-email': { kind: 'validation', message: 'That email address is not valid.' },
  'auth/user-disabled': { kind: 'auth', message: 'This account has been disabled.' },
  'auth/user-not-found': { kind: 'auth', message: 'No account found for these credentials.' },
  'auth/wrong-password': { kind: 'auth', message: 'Incorrect email or password.' },
  'auth/invalid-credential': { kind: 'auth', message: 'Incorrect email or password.' },
  'auth/email-already-in-use': {
    kind: 'validation',
    message: 'An account already exists for this email.',
  },
  'auth/weak-password': { kind: 'validation', message: 'Password is too weak (min 6 characters).' },
  'auth/too-many-requests': {
    kind: 'unavailable',
    message: 'Too many attempts. Please try again later.',
  },
  'auth/network-request-failed': {
    kind: 'network',
    message: 'Network error. Check your connection.',
  },
  'auth/expired-action-code': {
    kind: 'auth',
    message: 'This reset link has expired. Please request a new one.',
  },
  'auth/invalid-action-code': {
    kind: 'auth',
    message: 'This reset link is invalid or has already been used.',
  },
  // Firestore
  'permission-denied': { kind: 'permission', message: 'You do not have access to this resource.' },
  'not-found': { kind: 'not-found', message: 'The requested item was not found.' },
  unavailable: { kind: 'unavailable', message: 'Service temporarily unavailable. Please retry.' },
  unauthenticated: { kind: 'auth', message: 'Please sign in to continue.' },
  'deadline-exceeded': { kind: 'network', message: 'The request timed out. Please retry.' },
};

export const FirebaseErrorMapper = {
  /** Convert any thrown value into a normalized AppError. */
  toAppError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof FirebaseError) {
      const mapped = codeMap[error.code];
      if (mapped) {
        return new AppError({
          kind: mapped.kind,
          code: error.code,
          message: mapped.message,
          cause: error,
        });
      }
      return new AppError({
        kind: 'unknown',
        code: error.code,
        message: error.message,
        cause: error,
      });
    }
    return AppError.unknown(error);
  },
};
