import axios from 'axios';
import env from '@/config/env';
import { ApiError } from '@/lib/apiError';

/**
 * Single shared Axios instance. Import this everywhere instead of `axios`.
 *
 * The backend is a BFF: OAuth tokens live server-side, the browser only holds
 * cookies. So:
 *  - `withCredentials: true` sends the session cookies on every request.
 *  - `xsrf*` options make Axios read the JS-readable `wc_csrf` cookie and echo
 *    it in the `X-CSRF-Token` header (harmless if the backend ignores it on GET).
 *  - `withXSRFToken: true` makes Axios do that on *every* request, not just
 *    same-origin ones — its default only attaches the CSRF header when the
 *    request looks same-origin, which would silently drop it once
 *    `apiBaseUrl` points at a cross-origin backend (e.g. testing a deployed
 *    frontend against the Azure backend directly). Harmless when same-origin.
 *  - A 401 triggers one `POST /auth/refresh`, then the original request is
 *    retried once. If refresh fails, we hard-redirect to the BFF login route.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: env.csrfCookieName,
  xsrfHeaderName: env.csrfHeaderName,
});

/* -------------------------------------------------------------------------- */
/* Login navigation (full-page, not XHR)                                       */
/* -------------------------------------------------------------------------- */

const LOGIN_PATH = '/login';

const toRelativePath = (value) => (/^\/(?!\/)/.test(value) ? value : '/');

/**
 * Send the browser to the in-app sign-in gate (`/login`), carrying the page the
 * user was trying to reach as `?return_to=`. Used by the 401 interceptor. No-ops
 * if we're already on `/login` (prevents a reload loop while the gate itself
 * resolves the session).
 *
 * Always tags the URL with `session_expired=1` — by the time this runs, `/me`
 * has already 401'd and a refresh attempt has already failed, so `AuthProvider`
 * can skip re-checking `/me` on the fresh page load this triggers instead of
 * repeating a check whose answer we already know.
 */
export function redirectToLogin(
  returnTo = window.location.pathname + window.location.search,
) {
  if (window.location.pathname === LOGIN_PATH) return;
  const safe = toRelativePath(returnTo);
  const params = new URLSearchParams({ session_expired: '1' });
  if (safe !== '/') params.set('return_to', safe);
  window.location.assign(`${LOGIN_PATH}?${params}`);
}

/**
 * Hand off to the BFF's OAuth flow. Called from the `/login` page's button. The
 * BFF bounces through Microsoft and redirects back to `returnTo`.
 *
 * Resolved against `env.apiBaseUrl` (not left root-relative) — `/login` above
 * is an in-app SPA route, always same-origin, but `/auth/login` is a BFF
 * route. Root-relative would resolve against the frontend's own origin, which
 * is wrong once the BFF is deployed on a different one.
 */
export function beginOAuthLogin(returnTo = '/') {
  const safe = toRelativePath(returnTo);
  window.location.assign(
    `${env.apiBaseUrl}/auth/login?return_to=${encodeURIComponent(safe)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Request interceptor                                                         */
/* -------------------------------------------------------------------------- */

apiClient.interceptors.request.use((config) => {
  // Cookies + CSRF are handled by the instance config above. This is the single
  // place to add other cross-cutting request concerns (correlation id, locale).
  return config;
});

/* -------------------------------------------------------------------------- */
/* Response interceptor: 401 -> refresh once -> retry                          */
/* -------------------------------------------------------------------------- */

/** @type {null | (() => void)} */
let unauthorizedHandler = null;

/**
 * Register a callback invoked when the session is definitively gone (refresh
 * failed). The AuthProvider uses it to drop client auth state.
 */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

/** In-flight refresh shared by all concurrent 401s. */
let refreshInFlight = null;

function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = apiClient
      .post('/auth/refresh', null, { _isRefresh: true })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const status = response?.status ?? 0;

    if (status === 401 && config && !config._isRefresh) {
      if (!config._retry) {
        config._retry = true;
        const refreshed = await refreshSession();
        if (refreshed) {
          return apiClient(config);
        }
      }
      // Refresh failed, or the retry still came back 401.
      if (!env.authBypass) {
        unauthorizedHandler?.();
        redirectToLogin();
      }
    }

    return Promise.reject(toApiError(error));
  },
);

function toApiError(error) {
  const response = error.response;
  const payload = response?.data;

  return new ApiError({
    status: response?.status ?? 0,
    code: payload?.code ?? error.code ?? null,
    message:
      payload?.message ??
      payload?.error ??
      // FastAPI: string for HTTPException, array for validation errors.
      (typeof payload?.detail === 'string' ? payload.detail : null) ??
      error.message ??
      'Unexpected error. Please try again.',
    data: payload ?? null,
  });
}
