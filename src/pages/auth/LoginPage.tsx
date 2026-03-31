import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, errorMessage } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            setIsSubmitting(true);
            await login({ email, password });
            setIsSubmitting(false);
        }
    };


    return (
        // Contenedor principal dividido (flex-col en móvil, flex-row en escritorio)
        <div className="min-h-screen w-full flex flex-col lg:flex-row">

            {/* --- LADO IZQUIERDO: Branding y Fondo Oscuro --- */}
            {/* Ocupa toda la altura, y en desktop el 50% del ancho. Centra el contenido. */}
            <div
                className="relative w-full lg:w-1/2 h-64 lg:h-auto bg-secondary flex flex-col items-center justify-center p-10 overflow-hidden text-white"
                style={{
                    backgroundImage: "url('/patterns/geometric-dark.png')", // Asegúrate de que esta ruta sea correcta en tu proyecto
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                {/* Efectos de luz de fondo sutiles */}
                <div className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Ícono Grande */}
                    <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                        Ancome<span className="text-primary">Hub</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-sm font-light">
                        Cotiza al instante, gestiona tus facturas y complementos de pago, todo en un solo lugar.
                    </p>
                </div>
            </div>

            {/* --- LADO DERECHO: Formulario Limpio --- */}
            {/* Fondo blanco, ocupa el resto del espacio. Centra el formulario. */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">

                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-secondary mb-2">Bienvenido de nuevo</h2>
                        <p className="text-gray-500">
                            Por favor, ingresa tus credenciales para acceder al portal.
                        </p>
                    </div>

                    {/* --- ERROR MESSAGE --- */}
                    {errorMessage && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm text-sm flex items-start animate-pulse-short">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* --- FORMULARIO --- */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label='Correo Electrónico'
                            name="email"
                            type="email"
                            placeholder="admin@ancome.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            icon={<Mail />}
                            // Un pequeño ajuste visual para el input en fondo blanco puro
                            className="bg-gray-50 border-gray-200 focus:bg-white"
                        />

                        <div className="space-y-1">
                            <Input
                                label='Contraseña'
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="bg-gray-50 border-gray-200 focus:bg-white"
                                icon={<Lock />}
                            />
                            <div className="flex justify-end">
                                <Link to="/auth/recovery" className="text-sm text-primary hover:text-yellow-600 font-semibold hover:underline mt-2">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="default"
                                isLoading={isSubmitting}
                                className="h-14 text-lg font-bold shadow-md hover:shadow-xl transition-all"
                            >
                                {isSubmitting ? 'Iniciando sesión...' : 'Acceder al Portal'}
                            </Button>
                        </div>
                    </form>

                    {/* Footer sutil */}
                    <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400 font-light">
                        © {new Date().getFullYear()} Ancome Soluciones.
                    </div>
                </div>
            </div>
        </div>
    );
};