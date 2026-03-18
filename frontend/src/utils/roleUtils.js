const ADMIN_ROLES = ['ADMIN', 'ROLE_ADMIN'];
const MANAGER_ROLES = ['MANAGER', 'ROLE_MANAGER'];
const STAFF_ROLES = ['CASHIER', 'ROLE_CASHIER', 'INVENTORY_STAFF', 'ROLE_INVENTORY_STAFF', 'SALES_STAFF', 'ROLE_SALES_STAFF'];

const normalizeRoleName = (userOrRole) => {
  const rawRole =
    typeof userOrRole === 'string'
      ? userOrRole
      : userOrRole?.role?.name || userOrRole?.role || '';

  return String(rawRole).trim().toUpperCase();
};

const isAdminRole = (userOrRole) => ADMIN_ROLES.includes(normalizeRoleName(userOrRole));
const isManagerRole = (userOrRole) => MANAGER_ROLES.includes(normalizeRoleName(userOrRole));
const isStaffRole = (userOrRole) => STAFF_ROLES.includes(normalizeRoleName(userOrRole));

const canAccessAdminModule = (userOrRole) => isAdminRole(userOrRole);
const canAccessManagerModules = (userOrRole) => isManagerRole(userOrRole);
const canAccessStaffHrModules = (userOrRole) => isManagerRole(userOrRole) || isStaffRole(userOrRole);
const canViewProducts = (userOrRole) => isManagerRole(userOrRole) || isStaffRole(userOrRole);
const PRODUCT_MANAGE_ROLES = [...MANAGER_ROLES];
const canManageProducts = (userOrRole) => PRODUCT_MANAGE_ROLES.includes(normalizeRoleName(userOrRole));

export {
  ADMIN_ROLES,
  MANAGER_ROLES,
  STAFF_ROLES,
  normalizeRoleName,
  isAdminRole,
  isManagerRole,
  isStaffRole,
  canAccessAdminModule,
  canAccessManagerModules,
  canAccessStaffHrModules,
  canViewProducts,
  canManageProducts,
};
