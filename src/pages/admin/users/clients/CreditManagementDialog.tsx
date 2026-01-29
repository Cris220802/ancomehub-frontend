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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useAdminClients } from '../../hooks/useAdminClients';
import { useEffect } from 'react';
import { ClientDetailResponseDto } from '@/types/users';

const creditSchema = z.object({
    creditEnabled: z.boolean(),
});

type CreditFormValues = z.infer<typeof creditSchema>;

interface CreditManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: ClientDetailResponseDto | null;
}

export function CreditManagementDialog({
    open,
    onOpenChange,
    client,
}: CreditManagementDialogProps) {
    const { useManageCredit } = useAdminClients();
    const creditMutation = useManageCredit();

    const form = useForm<CreditFormValues>({
        resolver: zodResolver(creditSchema),
        defaultValues: {
            creditEnabled: false,
        },
    });

    useEffect(() => {
        if (client) {
            form.reset({
                creditEnabled: client.clientProfile.creditEnabled || false,
            });
        }
    }, [client, form]);

    const onSubmit = (values: CreditFormValues) => {
        if (!client) return;

        creditMutation.mutate(
            {
                userId: client.id,
                creditEnabled: values.creditEnabled,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gestión de Crédito</DialogTitle>
                    <DialogDescription>
                        Habilitar o deshabilitar el crédito para {client?.fullName || client?.email}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="creditEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Habilitar Crédito
                                        </FormLabel>
                                        <FormDescription>
                                            Permitir que este cliente realice compras a crédito.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
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
                            <Button type="submit" isLoading={creditMutation.isPending}>
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
