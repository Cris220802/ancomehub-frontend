import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useResetPassword } from '@/hooks/usePasswordRecovery';
import { toast } from 'sonner';

export const RecoveryPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutate: resetPassword, isPending } = useResetPassword();

    // Redirect if no token
    useEffect(() => {
        if (!token) {
            toast.error('Token de recuperación no válido o inexistente.');
            navigate('/auth/login');
        }
    }, [token, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (token) {
            resetPassword(
                { token, newPassword },
                {
                    onSuccess: () => {
                        // Delay redirect slightly to show success message or toast
                        setTimeout(() => {
                            navigate('/auth/login');
                        }, 2000);
                    },
                }
            );
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            {/* Branding Side */}
            <div
                className="relative w-full lg:w-1/2 h-64 lg:h-auto bg-secondary flex flex-col items-center justify-center p-10 overflow-hidden text-white"
                style={{
                    backgroundImage: "url('/patterns/geometric-dark.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                <div className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/5">
                        <Lock className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                        Nueva <span className="text-primary">Contraseña</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-sm font-light">
                        Establece una contraseña segura para proteger tu cuenta.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-secondary mb-2">Restablecer Contraseña</h2>
                        <p className="text-gray-500">
                            Ingresa tu nueva contraseña a continuación.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm text-sm flex items-start animate-pulse-short">
                            <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    label='Nueva Contraseña'
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="bg-gray-50 border-gray-200 focus:bg-white pr-10"
                                    icon={<Lock />}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            <Input
                                label='Confirmar Contraseña'
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 focus:bg-white"
                                icon={<Lock />}
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="default"
                                isLoading={isPending}
                                className="w-full h-14 text-lg font-bold shadow-md hover:shadow-xl transition-all"
                            >
                                {isPending ? 'Restableciendo...' : 'Restablecer Contraseña'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400 font-light">
                        <Link to="/auth/login" className="text-primary hover:underline">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
