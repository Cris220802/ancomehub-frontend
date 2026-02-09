import { useEffect, useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { updateClientDataDto } from '@/types/users';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const editClientSchema = z.object({
    companyName: z.string().min(1, 'La razón social es requerida'),
    taxId: z.string().min(1, 'El RFC es requerido'),
    requiresOrderPurchase: z.boolean(),
    billingAddress: z.object({
        street: z.string().min(1, "La calle es requerida"),
        exteriorNumber: z.string().min(1, "El número exterior es requerido"),
        interiorNumber: z.string().optional(),
        neighborhood: z.string().min(1, "La colonia es requerida"),
        city: z.string().min(1, "La ciudad es requerida"),
        state: z.string().min(1, "El estado es requerido"),
        zipCode: z.string().length(5, "El código postal debe tener 5 dígitos").regex(/^\d+$/, "El código postal debe contener solo números"),
        country: z.string().optional().default("México"),
    }),
});

type EditClientFormValues = z.infer<typeof editClientSchema>;

interface EditClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: any; // Using any for flexibility with partial data from backend
    onSubmit: (data: updateClientDataDto) => void;
    isLoading?: boolean;
}

export function EditClientDialog({
    open,
    onOpenChange,
    initialData,
    onSubmit,
    isLoading
}: EditClientDialogProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingValues, setPendingValues] = useState<EditClientFormValues | null>(null);

    const form = useForm<EditClientFormValues>({
        resolver: zodResolver(editClientSchema) as any,
        defaultValues: {
            companyName: '',
            taxId: '',
            requiresOrderPurchase: false,
            billingAddress: {
                street: '',
                exteriorNumber: '',
                interiorNumber: '',
                neighborhood: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'México',
            },
        },
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                companyName: initialData.clientProfile.companyName || '',
                taxId: initialData.clientProfile.taxId || '',
                requiresOrderPurchase: initialData.requiresOrderPurchase || false,
                billingAddress: {
                    street: initialData.clientProfile.billingAddress?.street || '',
                    exteriorNumber: initialData.clientProfile.billingAddress?.exteriorNumber || '',
                    interiorNumber: initialData.clientProfile.billingAddress?.interiorNumber || '',
                    neighborhood: initialData.clientProfile.billingAddress?.neighborhood || '',
                    city: initialData.clientProfile.billingAddress?.city || '',
                    state: initialData.clientProfile.billingAddress?.state || '',
                    zipCode: initialData.clientProfile.billingAddress?.zipCode || '',
                    country: initialData.clientProfile.billingAddress?.country || 'México',
                },
            });
        }
    }, [open, initialData, form]);

    const handleFormSubmit = (values: EditClientFormValues) => {
        setPendingValues(values);
        setShowConfirmDialog(true);
    };

    const handleConfirm = () => {
        if (pendingValues) {
            onSubmit(pendingValues);
            setShowConfirmDialog(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Información Fiscal</DialogTitle>
                        <DialogDescription>
                            Actualiza la información fiscal y de facturación del cliente.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Información General</h3>
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <FormField
                                    control={form.control}
                                    name="requiresOrderPurchase"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Requiere orden de compra
                                                </FormLabel>
                                                <DialogDescription>
                                                    ¿El cliente requiere orden de compra para realizar pedidos?
                                                </DialogDescription>
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
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium pt-4 border-t">Dirección de Facturación</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="billingAddress.street"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Calle</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Av. Principal" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="billingAddress.exteriorNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No. Exterior</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="billingAddress.interiorNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No. Interior (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Apt 4B" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="billingAddress.neighborhood"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Colonia</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Centro" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="billingAddress.city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ciudad</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ciudad de México" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="billingAddress.state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="CDMX" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="billingAddress.zipCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Código Postal</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="06000" maxLength={5} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={isLoading}>
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro de guardar los cambios?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción actualizará la información fiscal del cliente. Verifique que los datos sean correctos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
