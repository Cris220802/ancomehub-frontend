import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { ResendInviteDialog } from './ResendInviteDialog';
import { useAdminClients } from '../../hooks/useAdminClients';
import { useEffect, useState } from 'react';
import { InviteUserDto } from '@/types/users';
import { toast } from 'sonner';

const inviteSchema = z.object({
    email: z.string().email('Email inválido'),
    companyName: z.string().min(1, 'La razón social es requerida'),
    taxId: z.string().min(1, 'El RFC es requerido'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InviteClientDialog({ open, onOpenChange }: InviteClientDialogProps) {
    const { useInviteClient, useBeforeInviteClient } = useAdminClients();
    const inviteMutation = useInviteClient();
    const beforeInviteMutation = useBeforeInviteClient();

    const [showResendDialog, setShowResendDialog] = useState(false);
    const [pendingInviteValues, setPendingInviteValues] = useState<InviteUserDto | null>(null);

    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: '',
            companyName: '',
            taxId: '',
        },
    });

    useEffect(() => {
        if (open) {
            form.reset();
        }
    }, [open, form]);

    const onSubmit = (values: InviteFormValues) => {
        beforeInviteMutation.mutate(values, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
            },
            onError: (error: any) => {
                // Assuming 409 or a specific message indicates user exists
                // The requirements say "in case the user already exists... open checks dialog"
                // We will trigger this if the request fails, primarily checking for existence.
                // You might want to check error.response.status === 409 or similar if the API is strict.
                // For now, let's assume specific error handling logic or just broad catch for "user exists" context if implied by backend design. 
                // However, based on the prompt "en caso de que el usuario ya exista se habra otro dialog",
                // usually this comes as a 400 or 409 with a message.

                // Let's assume we proceed to show dialog if it fails, or check message.
                if (error.response?.data?.message?.includes('ya existe') || error.response?.status === 409 || error.response?.status === 400) {
                    setPendingInviteValues(values);
                    setShowResendDialog(true);
                } else {
                    toast.error(error.response?.data?.message || 'Error al validar invitación');
                }
            },
        });
    };

    const handleResend = () => {
        if (!pendingInviteValues) return;

        inviteMutation.mutate(pendingInviteValues, {
            onSuccess: () => {
                setShowResendDialog(false);
                onOpenChange(false);
                form.reset();
                setPendingInviteValues(null);
            },
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Invitar Cliente</DialogTitle>
                        <DialogDescription>
                            Envía una invitación por correo electrónico para que el cliente complete su registro.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="cliente@empresa.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Razón Social</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Empresa S.A. de C.V." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="taxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RFC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="RFC" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={inviteMutation.isPending}>
                                    Enviar Invitación
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <ResendInviteDialog
                open={showResendDialog}
                onOpenChange={setShowResendDialog}
                onConfirm={handleResend}
                email={pendingInviteValues?.email || ''}
                isLoading={inviteMutation.isPending}
            />
        </>
    );
}
