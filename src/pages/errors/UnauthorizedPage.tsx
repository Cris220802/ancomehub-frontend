import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-secondary">
            <div className="text-center space-y-6 max-w-md px-6">
                <div className="mx-auto bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="h-12 w-12 text-primary" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Acceso Restringido</h1>

                <p className="text-lg text-gray-600">
                    Lo sentimos, pero no tienes los permisos necesarios para acceder a esta página.
                </p>

                <div className="pt-4">
                    <Button
                        onClick={() => navigate('/')}
                        className="bg-primary hover:bg-yellow-500 text-gray-900 border-none px-8 py-2 font-semibold"
                    >
                        Volver al Inicio
                    </Button>
                </div>
            </div>
        </div>
    );
};
