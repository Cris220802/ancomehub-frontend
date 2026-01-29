import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useAdminAgents } from '../../hooks/useAdminAgents';

const agentSchema = z.object({
    fullName: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido'),
    phoneNumber: z.string().optional(),
    password: z.string().optional(),
}).refine(() => {
    // If it's creation (we handle this logic in component typically or schema variations), password IS required.
    // However, for simplicity allowing the component to manage strictness or checking context.
    // We'll trust the form logic to enforce it for creation.
    return true;
});

interface AgentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agentId?: string | null;
}

export function AgentFormDialog({ open, onOpenChange, agentId }: AgentFormDialogProps) {
    const { useCreateAgent, useUpdateAgent, useGetAgent } = useAdminAgents();
    const createMutation = useCreateAgent();
    const updateMutation = useUpdateAgent();

    // Only fetch if agentId is present
    const { data: agentData, isLoading: isLoadingAgent } = useGetAgent(agentId || '');

    const form = useForm<z.infer<typeof agentSchema>>({
        resolver: zodResolver(agentSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phoneNumber: '',
            password: '',
        },
    });

    useEffect(() => {
        if (open) {
            form.reset();
            if (agentId && agentData) {
                form.reset({
                    fullName: agentData.fullName,
                    email: agentData.email,
                    phoneNumber: '', // DTO doesn't seem to have phone number on AgentResponseDto looking at types file? 
                    // Let me check AgentResponseDto again.
                    // AgentResponseDto: id, email, fullName, status, clientProfile, createdAt. 
                    // It does NOT have phoneNumber. Wait, CreateUserDto has phoneNumber.
                    // If the backend doesn't return phoneNumber for Agents, we might not be able to edit it or populate it.
                    // I'll leave it empty for now or assume it might be in details later.
                    // Based on requirements: "phoneNumber: Teléfono (Opcional)."
                    // I will populate it if I can finding it, but if DTO lacks it, it stays empty.
                    password: '',
                });
            }
        }
    }, [open, agentId, agentData, form]);

    const onSubmit = (values: z.infer<typeof agentSchema>) => {
        if (agentId) {
            // Edit
            updateMutation.mutate({
                id: agentId,
                dto: {
                    fullName: values.fullName,
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    // Only send password if provided
                    ...(values.password ? { password: values.password } : {}),
                }
            }, {
                onSuccess: () => onOpenChange(false)
            });
        } else {
            // Create
            if (!values.password) {
                form.setError('password', { message: 'La contraseña es requerida para nuevos agentes' });
                return;
            }
            createMutation.mutate({
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phoneNumber,
                password: values.password,
                role: 'AGENT',
            }, {
                onSuccess: () => onOpenChange(false)
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const title = agentId ? 'Editar Agente' : 'Nuevo Agente';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                {agentId && isLoadingAgent ? (
                    <div className="py-4">Cargando datos...</div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Completo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Juan Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="agente@ancome.com" {...field} />
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
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="555-555-5555" {...field} />
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
                                        <FormLabel>{agentId ? 'Contraseña (Opcional)' : 'Contraseña'}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={isPending}>
                                    {agentId ? 'Guardar Cambios' : 'Crear Agente'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
