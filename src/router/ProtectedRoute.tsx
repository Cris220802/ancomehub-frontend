import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export const ProtectedRoute = () => {
    const { status } = useAuthStore();

    if (status === 'checking') {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl font-semibold">Cargando...</div>
            </div>
        );
    }

    if (status === 'not-authenticated') {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
};
