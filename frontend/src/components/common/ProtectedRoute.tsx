import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

interface ProtectedRouteProps {
    requireAuth: boolean;
}

export default function ProtectedRoute({ requireAuth }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();

    if (requireAuth) {
        return isAuthenticated
            ? <Outlet />
            : <Navigate to="/signin" replace />;
    } else {
        return !isAuthenticated
            ? <Outlet />
            : <Navigate to="/" replace />;
    }
};