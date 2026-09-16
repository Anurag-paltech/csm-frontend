import env from '@/config/env';

/**
 * Non-authoritative cache of the authenticated user snapshot ({ id, name,
 * email, roles }). Used ONLY to hydrate the UI instantly on page reload and to
 * drive client-side route guards.
 *
 * The real session is an httpOnly cookie that JavaScript cannot read. The
 * server remains the source of truth for both authentication and
 * authorization; every session is revalidated via `authApi.me()` on load, and
 * the backend must independently enforce access on every request.
 */

export function readCachedUser() {
  try {
    const raw = localStorage.getItem(env.authUserKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCachedUser(user) {
  try {
    if (user) {
      localStorage.setItem(env.authUserKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(env.authUserKey);
    }
  } catch {
    // Storage unavailable (private mode, disabled). The app still works; it
    // just re-fetches the user on every reload.
  }
}

export function clearCachedUser() {
  writeCachedUser(null);
}
