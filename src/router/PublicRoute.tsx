import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export const PublicRoute = () => {
    const { status } = useAuthStore();

    if (status === 'authenticated') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
