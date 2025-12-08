import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is logged in but profile is not complete, and they are not already on the completion page
    if (!user.profileComplete && location.pathname !== '/profile-completion') {
        return <Navigate to="/profile-completion" replace />;
    }

    // If user is logged in and profile IS complete, but they try to access completion page, redirect to dashboard/home
    if (user.profileComplete && location.pathname === '/profile-completion') {
        return <Navigate to="/" replace />; // Or /dashboard
    }

    return children;
};

export default ProtectedRoute;
