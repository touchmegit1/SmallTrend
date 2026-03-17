import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    MANAGER_ROLES,
    CASHIER_ROLES,
    INVENTORY_ROLES,
    hasAnyRole,
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
            console.error('Access denied - User role:', user?.role, 'Required roles:', allowedRoles);

            if (hasAnyRole(user, INVENTORY_ROLES)) {
                return <Navigate to="/inventory" replace />;
            }
            if (hasAnyRole(user, CASHIER_ROLES)) {
                return <Navigate to="/pos" replace />;
            }
            if (hasAnyRole(user, MANAGER_ROLES)) {
                return <Navigate to="/dashboard" replace />;
            }

            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

