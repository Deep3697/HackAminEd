import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // TODO: Replace with actual authentication check
    const isAuthenticated = true;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
