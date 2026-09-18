export const ROLES = {
  ADMIN: "Admin",
  USER_BUSINESS: "user_business",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.USER_BUSINESS]: "Business User",
};

export const roleLabel = (role) => ROLE_LABELS[role] ?? role;
