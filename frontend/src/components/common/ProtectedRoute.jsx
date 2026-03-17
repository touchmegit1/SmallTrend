import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
        const userRole = user?.role;
        const hasAccess = allowedRoles.includes(userRole);

        if (!hasAccess) {
            console.error('Access denied - User role:', userRole, 'Required roles:', allowedRoles);
            // Redirect non-authorized users to POS (default workspace for staff)
            return <Navigate to="/pos" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

