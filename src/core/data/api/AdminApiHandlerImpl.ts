import type { AdminApiHandler } from './AdminApiHandler';
import { AppError } from '../../errors/AppError';

/**
 * HTTP-backed AdminApiHandler. Talks to the same-origin Vercel serverless
 * function at `/api/delete-user` (see `api/delete-user.ts`). Same origin means
 * no CORS and no base-URL config. All failures map to AppError so callers never
 * see raw fetch errors.
 */
export class AdminApiHandlerImpl implements AdminApiHandler {
  async deleteAuthUser(uid: string, idToken: string): Promise<void> {
    let res: Response;
    try {
      res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid }),
      });
    } catch {
      throw new AppError({
        kind: 'unknown',
        code: 'admin/network',
        message: 'Could not reach the server. Please try again.',
      });
    }

    if (!res.ok) {
      const code = res.status === 403 ? 'admin/forbidden' : 'admin/delete-failed';
      throw new AppError({
        kind: 'unknown',
        code,
        message:
          res.status === 403
            ? 'You are not allowed to delete this user.'
            : 'Deleting the user failed on the server.',
      });
    }
  }
}
