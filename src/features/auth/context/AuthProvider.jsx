import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { authApi } from '@/features/auth/api/authApi';
import { setUnauthorizedHandler, beginOAuthLogin } from '@/lib/apiClient';
import {
  readCachedUser,
  writeCachedUser,
  clearCachedUser,
} from '@/lib/authStorage';
import env from '@/config/env';

/** Mock user used when `env.authBypass` is on (dev only). */
const BYPASS_USER = {
  name: 'Dev User',
  username: 'dev@localhost',
  roles: env.authBypassRoles,
};

/**
 * Owns global authentication state. The session lives in httpOnly cookies owned
 * by the BFF; this provider only tracks the user snapshot from `GET /me`
 * (identity + roles + scopes) used to render the UI and guard routes.
 *
 * When `env.authBypass` is on, all network auth is skipped and the app runs as
 * BYPASS_USER. See AUTH.md → "Development bypass".
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    env.authBypass ? BYPASS_USER : readCachedUser(),
  );
  const [status, setStatus] = useState(
    env.authBypass ? 'authenticated' : 'loading',
  );

  /** Fetch `GET /me` and resolve auth status. */
  const reload = useCallback(async () => {
    if (env.authBypass) return;
    try {
      const me = await authApi.me();
      writeCachedUser(me);
      setUser(me);
      setStatus('authenticated');
    } catch (err) {
      if (err?.status === 401) {
        // The interceptor already tried refresh and redirected to login.
        clearCachedUser();
        setUser(null);
        setStatus('unauthenticated');
      } else {
        // Network / server error — surface it instead of redirect-looping.
        setStatus('error');
      }
    }
  }, []);

  /** Kick off the OAuth flow (from the `/login` page's button). */
  const login = useCallback((returnTo) => {
    if (env.authBypass) {
      setUser(BYPASS_USER);
      setStatus('authenticated');
      return;
    }
    beginOAuthLogin(returnTo);
  }, []);

  const logout = useCallback(async () => {
    if (env.authBypass) return;
    try {
      await authApi.logout();
    } catch {
      // Ignore — we send the user to the sign-in gate regardless.
    }
    clearCachedUser();
    setUser(null);
    window.location.assign('/login?signed_out=1');
  }, []);

  // Session definitively gone (interceptor's refresh failed).
  useEffect(() => {
    if (env.authBypass) {
      console.warn(
        '[auth] VITE_AUTH_BYPASS is enabled — authentication is disabled (dev only).',
      );
      return undefined;
    }
    setUnauthorizedHandler(() => {
      clearCachedUser();
      setUser(null);
      setStatus('unauthenticated');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // Resolve the session on app load.
  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(() => {
    const roles = user?.roles ?? [];
    return {
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      isAuthBypassed: env.authBypass,
      roles,
      hasRole: (role) => roles.includes(role),
      hasAnyRole: (required) => required.some((role) => roles.includes(role)),
      login,
      logout,
      reload,
    };
  }, [user, status, login, logout, reload]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
