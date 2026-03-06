import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirect based on role if they try to access a page they shouldn't
        return user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
