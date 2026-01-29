import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UsersService } from '@/services/users.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Lock, User } from 'lucide-react';

const registerSchema = z.object({
    fullName: z.string().min(1, 'El nombre completo es requerido'),
    phoneNumber: z.string().min(1, 'El telefono es requerido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const ConfirmInvitationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/auth/login');
        }
    }, [token, navigate]);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        if (!token) return;

        setIsLoading(true);
        try {
            await UsersService.completeRegistration({
                token,
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                password: values.password,
                // confirmPassword is not part of the DTO usually, check if DTO requires it, 
                // typical DTO: { token, fullName, password, confirmPassword? }
                // The interface has confirmPassword as optional, so we can send it or not.
                // Sending just in case logic needs it, but mostly strict DTOs ignore it.
                confirmPassword: values.confirmPassword,
            });
            toast.success('Cuenta activada correctamente');
            navigate('/auth/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al completar el registro. El token puede haber expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4"
            style={{
                backgroundImage: "url('/patterns/geometric-dark.png')", // Manteniendo consistencia sutil
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundBlendMode: "overlay"
            }}
        >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 sm:p-10">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Completa tu registro</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Ingresa tus datos para activar tu cuenta en <span className="font-semibold text-primary">AncomeHub</span>
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Completo</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input className="pl-10" placeholder="Juan Pérez" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefono</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input type="number" className="pl-10" placeholder="1234567890" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input type="password" className="pl-10" placeholder="••••••••" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input type="password" className="pl-10" placeholder="••••••••" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full mt-6 h-11 text-base"
                                isLoading={isLoading}
                            >
                                {isLoading ? 'Activando cuenta...' : 'Activar Cuenta'}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        ¿Ya tienes cuenta? <span className="text-primary cursor-pointer hover:underline" onClick={() => navigate('/auth/login')}>Iniciar Sesión</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
