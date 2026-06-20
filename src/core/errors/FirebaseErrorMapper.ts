import { FirebaseError } from 'firebase/app';
import { AppError, type AppErrorKind } from './AppError';

/** Maps Firebase Auth + Firestore error codes to friendly AppErrors. */
const codeMap: Record<string, { kind: AppErrorKind; message: string }> = {
  // ── Auth: user & account ──────────────────────────────────────────────────
  'auth/user-not-found': { kind: 'auth', message: 'No account found for these credentials.' },
  'auth/user-disabled': { kind: 'auth', message: 'This account has been disabled.' },
  'auth/email-already-in-use': {
    kind: 'validation',
    message: 'An account already exists for this email.',
  },
  'auth/email-already-exists': {
    kind: 'validation',
    message: 'An account already exists for this email.',
  },
  'auth/account-exists-with-different-credential': {
    kind: 'auth',
    message: 'An account already exists with a different sign-in method.',
  },
  'auth/user-mismatch': { kind: 'auth', message: 'Credential does not match the signed-in user.' },

  // ── Auth: passwords & emails ──────────────────────────────────────────────
  'auth/invalid-email': { kind: 'validation', message: 'That email address is not valid.' },
  'auth/wrong-password': { kind: 'auth', message: 'Incorrect email or password.' },
  'auth/weak-password': { kind: 'validation', message: 'Password is too weak (min 6 characters).' },
  'auth/invalid-password': {
    kind: 'validation',
    message: 'Password must be at least 6 characters.',
  },
  'auth/invalid-password-hash': { kind: 'validation', message: 'Invalid password hash.' },
  'auth/invalid-password-salt': { kind: 'validation', message: 'Invalid password salt.' },

  // ── Auth: tokens & credentials ────────────────────────────────────────────
  'auth/invalid-credential': { kind: 'auth', message: 'Incorrect email or password.' },
  'auth/invalid-id-token': {
    kind: 'auth',
    message: 'Invalid session token. Please sign in again.',
  },
  'auth/id-token-expired': { kind: 'auth', message: 'Session expired. Please sign in again.' },
  'auth/id-token-revoked': { kind: 'auth', message: 'Session was revoked. Please sign in again.' },
  'auth/user-token-expired': { kind: 'auth', message: 'Session expired. Please sign in again.' },
  'auth/invalid-provider-data': { kind: 'validation', message: 'Invalid provider data.' },
  'auth/invalid-provider-id': { kind: 'validation', message: 'Invalid provider ID.' },

  // ── Auth: phone ───────────────────────────────────────────────────────────
  'auth/missing-phone-number': { kind: 'validation', message: 'Phone number is required.' },
  'auth/invalid-phone-number': {
    kind: 'validation',
    message: 'Phone number format is invalid (use E.164).',
  },
  'auth/missing-verification-code': {
    kind: 'validation',
    message: 'Verification code is required.',
  },
  'auth/invalid-verification-code': {
    kind: 'validation',
    message: 'Verification code is incorrect.',
  },
  'auth/missing-verification-id': { kind: 'validation', message: 'Verification ID is missing.' },
  'auth/invalid-verification-id': { kind: 'validation', message: 'Verification ID is invalid.' },
  'auth/code-expired': {
    kind: 'auth',
    message: 'The SMS code has expired. Please request a new one.',
  },

  // ── Auth: MFA ─────────────────────────────────────────────────────────────
  'auth/missing-multi-factor-session': {
    kind: 'auth',
    message: 'First-factor sign-in proof is missing.',
  },
  'auth/missing-multi-factor-info': {
    kind: 'validation',
    message: 'Second-factor identifier was not provided.',
  },
  'auth/invalid-multi-factor-session': {
    kind: 'auth',
    message: 'First-factor sign-in proof is invalid.',
  },
  'auth/multi-factor-info-not-found': {
    kind: 'not-found',
    message: 'No matching second factor found for this account.',
  },
  'auth/multi-factor-auth-required': {
    kind: 'auth',
    message: 'A second factor is required to complete sign-in.',
  },
  'auth/second-factor-already-in-use': {
    kind: 'validation',
    message: 'This second factor is already enrolled.',
  },

  // ── Auth: links & OOB actions ─────────────────────────────────────────────
  'auth/expired-action-code': {
    kind: 'auth',
    message: 'This link has expired. Please request a new one.',
  },
  'auth/invalid-action-code': {
    kind: 'auth',
    message: 'This link is invalid or has already been used.',
  },
  'auth/invalid-continue-uri': { kind: 'validation', message: 'The continue URL is not valid.' },
  'auth/unauthorized-continue-uri': {
    kind: 'permission',
    message: 'The continue URL domain is not whitelisted.',
  },
  'auth/invalid-dynamic-link-domain': {
    kind: 'validation',
    message: 'The dynamic link domain is not configured for this project.',
  },

  // ── Auth: system, quotas & networking ────────────────────────────────────
  'auth/network-request-failed': {
    kind: 'network',
    message: 'Network error. Check your connection.',
  },
  'auth/too-many-requests': {
    kind: 'unavailable',
    message: 'Too many attempts. Please try again later.',
  },
  'auth/operation-not-allowed': {
    kind: 'permission',
    message: 'This sign-in method is not enabled.',
  },
  'auth/quota-exceeded': {
    kind: 'unavailable',
    message: 'Service quota exceeded. Please try again later.',
  },
  'auth/captcha-check-failed': { kind: 'validation', message: 'reCAPTCHA verification failed.' },
  'auth/app-not-authorized': {
    kind: 'auth',
    message: 'This app is not authorized to use Firebase Authentication.',
  },
  'auth/unauthorized-domain': {
    kind: 'permission',
    message: 'This domain is not authorized in the Firebase console.',
  },

  // ── Auth: admin SDK ───────────────────────────────────────────────────────
  'auth/claims-too-large': {
    kind: 'validation',
    message: 'Custom claims payload exceeds the 1000-byte limit.',
  },
  'auth/invalid-claims': { kind: 'validation', message: 'Custom claim attributes are invalid.' },
  'auth/insufficient-permission': {
    kind: 'permission',
    message: 'Admin SDK credential lacks required permissions.',
  },
  'auth/internal-error': { kind: 'unknown', message: 'An internal authentication error occurred.' },
  'auth/invalid-argument': {
    kind: 'validation',
    message: 'Invalid argument passed to authentication.',
  },
  'auth/invalid-creation-time': {
    kind: 'validation',
    message: 'Creation time must be a valid UTC date string.',
  },
  'auth/invalid-last-sign-in-time': {
    kind: 'validation',
    message: 'Last sign-in time must be a valid UTC date string.',
  },
  'auth/invalid-disabled-field': {
    kind: 'validation',
    message: 'The disabled field must be a boolean.',
  },
  'auth/invalid-display-name': {
    kind: 'validation',
    message: 'Display name must be a non-empty string.',
  },
  'auth/invalid-email-verified': {
    kind: 'validation',
    message: 'The emailVerified field must be a boolean.',
  },
  'auth/invalid-photo-url': {
    kind: 'validation',
    message: 'Photo URL must be a valid URL string.',
  },
  'auth/invalid-page-token': {
    kind: 'validation',
    message: 'The page token for listUsers() is invalid.',
  },

  // ── Auth: admin hashing ───────────────────────────────────────────────────
  'auth/invalid-hash-algorithm': { kind: 'validation', message: 'Unsupported hash algorithm.' },
  'auth/invalid-hash-block-size': {
    kind: 'validation',
    message: 'Hash block size must be a valid number.',
  },
  'auth/invalid-hash-derived-key-length': {
    kind: 'validation',
    message: 'Derived key length must be a valid number.',
  },
  'auth/invalid-hash-key': { kind: 'validation', message: 'Hash key must be a valid byte buffer.' },
  'auth/invalid-hash-memory-cost': {
    kind: 'validation',
    message: 'Hash memory cost must be a valid number.',
  },
  'auth/invalid-hash-parallelization': {
    kind: 'validation',
    message: 'Hash parallelization must be a valid number.',
  },
  'auth/invalid-hash-rounds': {
    kind: 'validation',
    message: 'Hash rounds must be a valid number.',
  },
  'auth/invalid-hash-salt-separator': {
    kind: 'validation',
    message: 'Hash salt separator must be a valid byte buffer.',
  },

  // ── Firestore gRPC codes ──────────────────────────────────────────────────
  cancelled: { kind: 'unknown', message: 'The operation was cancelled.' },
  unknown: { kind: 'unknown', message: 'An unknown error occurred.' },
  'invalid-argument': { kind: 'validation', message: 'Invalid argument provided to Firestore.' },
  'deadline-exceeded': { kind: 'network', message: 'The request timed out. Please retry.' },
  'not-found': { kind: 'not-found', message: 'The requested item was not found.' },
  'already-exists': { kind: 'validation', message: 'This item already exists.' },
  'permission-denied': { kind: 'permission', message: 'You do not have access to this resource.' },
  'resource-exhausted': {
    kind: 'unavailable',
    message: 'Quota or rate limit exceeded. Please try again later.',
  },
  'failed-precondition': {
    kind: 'validation',
    message: 'Operation rejected — the system is not in the required state (e.g. a missing index).',
  },
  aborted: {
    kind: 'unknown',
    message: 'The operation was aborted due to a conflict. Please retry.',
  },
  'out-of-range': { kind: 'validation', message: 'Operation attempted past a valid range.' },
  unimplemented: { kind: 'unknown', message: 'This operation is not supported.' },
  internal: { kind: 'unknown', message: 'An internal Firestore error occurred.' },
  unavailable: { kind: 'unavailable', message: 'Service temporarily unavailable. Please retry.' },
  'data-loss': { kind: 'unknown', message: 'Unrecoverable data loss or corruption.' },
  unauthenticated: { kind: 'auth', message: 'Please sign in to continue.' },
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
