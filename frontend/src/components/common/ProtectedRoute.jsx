import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    ADMIN_ROLES,
    MANAGER_ROLES,
    CASHIER_ROLES,
    INVENTORY_ROLES,
    STAFF_ROLES,
    hasAnyRole,
    normalizeRole,
} from '../../utils/rolePermissions';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0) {
        const hasAccess = hasAnyRole(user, allowedRoles);

        if (!hasAccess) {
            if (hasAnyRole(user, ADMIN_ROLES)) {
                return <Navigate to="/dashboard" replace />;
            }
            if (hasAnyRole(user, MANAGER_ROLES)) {
                return <Navigate to="/dashboard" replace />;
            }
            if (hasAnyRole(user, INVENTORY_ROLES)) {
                return <Navigate to="/inventory" replace />;
            }
            if (hasAnyRole(user, CASHIER_ROLES)) {
                return <Navigate to="/pos" replace />;
            }
            if (hasAnyRole(user, STAFF_ROLES)) {
                return <Navigate to="/hr/schedule" replace />;
            }
            const normalizedRole = normalizeRole(user);
            if (normalizedRole) {
                return <Navigate to="/dashboard" replace />;
            }
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

