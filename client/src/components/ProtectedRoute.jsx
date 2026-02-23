import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, loading, role } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to their appropriate dashboard based on their role
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'seller') return <Navigate to="/seller" replace />;
        return <Navigate to="/buyer" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
