import { apiClient } from '@/lib/apiClient';

/**
 * Auth endpoints exposed by the BFF.
 *
 * Login is NOT here — it is a full-page navigation to `/auth/login?return_to=…`
 * (see `redirectToLogin` in `lib/apiClient.js`), because the BFF drives the
 * OAuth redirect flow through Microsoft.
 *
 * `POST /auth/refresh` is also not here — it is called only by the response
 * interceptor in `lib/apiClient.js`.
 */
export const authApi = {
  /**
   * Current user. 200 = logged in, 401 = not.
   * Shape: { name, username, roles: string[] }.
   */
  async me() {
    const { data } = await apiClient.get('/me');
    return data;
  },

  /** Ends the session server-side. Caller then redirects to login. */
  async logout() {
    await apiClient.post('/auth/logout');
  },
};
