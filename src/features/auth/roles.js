/**
 * Canonical role identifiers returned by `GET /me` in `user.roles`. Reference
 * these constants instead of raw strings.
 *
 * - `admin`         — full access to everything.
 * - `user_business` — access to the business data.
 *
 * The backend enforces access regardless; client-side checks are cosmetic.
 */
export const ROLES = {
  ADMIN: "Admin",
  USER_BUSINESS: "user_business",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.USER_BUSINESS]: "Business User",
};

/** Human label for a role value; falls back to the raw value. */
export const roleLabel = (role) => ROLE_LABELS[role] ?? role;
