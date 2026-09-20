const env = {
  /** Base URL for API requests. Empty string = root-relative */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",

  /** Name of the JS-readable CSRF cookie set by the BFF. */
  csrfCookieName: "wc_csrf",
  /** Header the CSRF token must be echoed in on unsafe requests. */
  csrfHeaderName: "X-CSRF-Token",

  /** localStorage key for the cached (non-authoritative) user snapshot */
  authUserKey: "warranty_claims.auth_user",

  isDev: import.meta.env.DEV,

  /** Bypass authentication */
  authBypass:
    import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === "true",
  /** Roles granted to the bypass user (comma-separated env var). */
  authBypassRoles: (
    import.meta.env.VITE_AUTH_BYPASS_ROLES ?? "admin,user_business"
  )
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean),

  /** Default filters for recommendations screen. */
  defaultMinConfidence:
    Number(import.meta.env.VITE_DEFAULT_MIN_CONFIDENCE) || 0,
  defaultMinHours: import.meta.env.VITE_DEFAULT_MIN_HOURS ?? "",
};

export default env;
