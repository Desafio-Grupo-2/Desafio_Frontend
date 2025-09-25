import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, user } = useSelector(state => state.auth);

    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }

    // Si se especifican roles permitidos, verificar que el usuario tenga uno de esos roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
