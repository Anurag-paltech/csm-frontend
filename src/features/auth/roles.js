export const ROLES = {
  ADMIN: "admin",
  USER_BUSINESS: "business_user",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.USER_BUSINESS]: "Business User",
};

export const roleLabel = (role) => ROLE_LABELS[role] ?? role;
