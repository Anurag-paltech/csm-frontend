/**
 * Single source of truth for in-app route paths. Reference these instead of
 * hardcoding strings in components, links, and redirects.
 *
 * `paths.login` is a public SPA page; its button hands off to the BFF's
 * `/auth/login` (see `beginOAuthLogin` in `lib/apiClient.js`).
 */
export const paths = {
  /** Public in-app sign-in gate (button → BFF `/auth/login`). */
  login: '/login',
  dashboard: '/',

  history: '/history',

  admin: {
    root: '/admin',
  },

  forbidden: '/403',
};
