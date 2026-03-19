export const ADMIN_ROLES = ["ADMIN", "ROLE_ADMIN"];
export const MANAGER_ROLES = ["MANAGER", "ROLE_MANAGER"];
export const CASHIER_ROLES = ["CASHIER", "ROLE_CASHIER"];
export const INVENTORY_ROLES = ["INVENTORY_STAFF", "ROLE_INVENTORY_STAFF"];

export const PRODUCT_VIEW_ROLES = [
  ...MANAGER_ROLES,
  ...CASHIER_ROLES,
  ...INVENTORY_ROLES,
];

export const PRODUCT_READONLY_ROLES = [...CASHIER_ROLES, ...INVENTORY_ROLES];

export const POS_ROLES = [...CASHIER_ROLES];
export const INVENTORY_OVERVIEW_ROLES = [
  ...MANAGER_ROLES,
  ...CASHIER_ROLES,
  ...INVENTORY_ROLES,
];
export const INVENTORY_FULL_ROLES = [...MANAGER_ROLES, ...INVENTORY_ROLES];
export const HR_SCHEDULE_ATTENDANCE_ROLES = [
  ...MANAGER_ROLES,
  ...CASHIER_ROLES,
  ...INVENTORY_ROLES,
];

export const CRM_ROLES = [...MANAGER_ROLES];
export const NON_ADMIN_ROLES = [
  ...MANAGER_ROLES,
  ...CASHIER_ROLES,
  ...INVENTORY_ROLES,
];

export const normalizeRole = (input) => {
  const rawRole = input?.role?.name || input?.role || input;
  return String(rawRole || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
};

export const hasAnyRole = (roleOrUser, allowedRoles = []) => {
  const role = normalizeRole(roleOrUser);
  return allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === role);
};

export const isProductReadOnlyRole = (roleOrUser) =>
  hasAnyRole(roleOrUser, PRODUCT_READONLY_ROLES);

export const canPerform = (roleOrUser, actionKey) => {
  const role = normalizeRole(roleOrUser);

  if (hasAnyRole(role, ADMIN_ROLES)) return true;

  if (hasAnyRole(role, MANAGER_ROLES)) {
    return !actionKey.startsWith("admin.");
  }

  if (hasAnyRole(role, INVENTORY_ROLES)) {
    return true;
  }

  if (hasAnyRole(role, CASHIER_ROLES)) {
    return actionKey === "inventory.location.viewStock";
  }

  return false;
};
