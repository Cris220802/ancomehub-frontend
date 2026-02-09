import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useSendRecoveryToken } from '@/hooks/usePasswordRecovery';

export const SendEmailRecoveryPage = () => {
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const { mutate: sendToken, isPending } = useSendRecoveryToken();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            sendToken({ email }, {
                onSuccess: () => setIsSuccess(true)
            });
        }
    };

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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                        Recuperar <span className="text-primary">Cuenta</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-sm font-light">
                        Te ayudaremos a restablecer tu contraseña para que puedas volver a gestionar tu negocio.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {isSuccess ? (
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Correo Enviado!</h2>
                                <p className="text-gray-500 mb-6">
                                    Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>.
                                    Por favor revisa tu bandeja de entrada.
                                </p>
                                <Link to="/auth/login">
                                    <Button variant="outline" className="w-full">
                                        Volver al inicio de sesión
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center lg:text-left mb-10">
                                <Link to="/auth/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al login
                                </Link>
                                <h2 className="text-3xl font-bold text-secondary mb-2">¿Olvidaste tu contraseña?</h2>
                                <p className="text-gray-500">
                                    Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecerla.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    label='Correo Electrónico'
                                    name="email"
                                    type="email"
                                    placeholder="tucorreo@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    icon={<Mail />}
                                    className="bg-gray-50 border-gray-200 focus:bg-white"
                                />

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        variant="default"
                                        isLoading={isPending}
                                        className="w-full h-14 text-lg font-bold shadow-md hover:shadow-xl transition-all"
                                    >
                                        {isPending ? 'Enviando...' : 'Enviar Instrucciones'}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400 font-light">
                        © {new Date().getFullYear()} Ancome Soluciones.
                    </div>
                </div>
            </div>
        </div>
    );
};
