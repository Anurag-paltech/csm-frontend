/**
 * Centralized, typed-ish access to build-time configuration.
 * Never read `import.meta.env` directly outside this module.
 */
const env = {
  /**
   * Base URL for API requests. Empty string = root-relative, which matches the
   * BFF (`/me`, `/auth/*`, business endpoints all live at the app origin).
   * Override only when the API is served from another origin.
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',

  /** Name of the JS-readable CSRF cookie set by the BFF. */
  csrfCookieName: 'wc_csrf',
  /** Header the CSRF token must be echoed in on unsafe requests. */
  csrfHeaderName: 'X-CSRF-Token',

  /**
   * localStorage key for the cached (non-authoritative) user snapshot used to
   * hydrate the UI on reload. The session itself lives in httpOnly cookies
   * owned by the BFF.
   */
  authUserKey: 'warranty_claims.auth_user',

  isDev: import.meta.env.DEV,

  /**
   * DEV ONLY. When true, authentication is skipped and the app runs as a mock
   * authenticated user. Guarded by `import.meta.env.DEV`, so it is always false
   * in a production build regardless of the env var.
   */
  authBypass:
    import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true',

  /**
   * Roles granted to the bypass user (comma-separated env var). The fallback
   * literal must match the values in `features/auth/roles.js` — this module is
   * a lower layer than `features/` so it can't import `ROLES` directly.
   */
  authBypassRoles: (
    import.meta.env.VITE_AUTH_BYPASS_ROLES ?? 'admin,user_business'
  )
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean),
};

export default env;
