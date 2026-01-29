
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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { useWarehouses } from '@/pages/admin/hooks/useAdminWarehouse';
import { CreateWarehouseDto } from '@/types/warehouse';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    address: z.string().optional(),
    description: z.string().optional(),
    isDefault: z.boolean().default(false),
});

interface CreateWarehouseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CreateWarehouseDialog = ({ open, onOpenChange }: CreateWarehouseDialogProps) => {
    const { useCreateWarehouse } = useWarehouses();
    const createMutation = useCreateWarehouse();

    const form = useForm<CreateWarehouseDto>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            address: '',
            isDefault: false,
        },
    });

    const onSubmit = (values: CreateWarehouseDto) => {
        createMutation.mutate(values, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Almacén</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo almacén físico o lógico para gestionar inventario.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Almacén Central" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Dirección física del almacén" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Almacén Principal</FormLabel>
                                        <FormDescription>
                                            Este almacén será usado por defecto para operaciones.
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
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Crear Almacén
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
