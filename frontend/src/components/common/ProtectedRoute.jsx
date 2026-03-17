import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole, isManagerRole, normalizeRoleName } from '../../utils/roleUtils';

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
        const userRole = normalizeRoleName(user);
        const hasAccess = allowedRoles
            .map((role) => String(role || '').toUpperCase())
            .includes(userRole);

        if (!hasAccess) {
            if (isAdminRole(user) || isManagerRole(user)) {
                return <Navigate to="/dashboard" replace />;
            }
            return <Navigate to="/hr/schedule" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

