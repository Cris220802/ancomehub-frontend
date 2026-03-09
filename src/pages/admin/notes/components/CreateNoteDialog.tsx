import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { useAdminNotes } from "@/pages/admin/hooks/useAdminNotes";
import { WeakClientSelect } from "./WeakClientSelect";

const createNoteSchema = z.object({
    folio: z.coerce.number().min(1, "El folio es requerido y mayor a 0"),
    date: z.string().min(1, "La fecha es requerida"),
    weakClientId: z.string().min(1, "Debe seleccionar un cliente"),
    totalAmount: z.coerce.number().min(0.01, "El total debe ser mayor a 0"),
    hasIva: z.boolean().default(false),
    subtotalAmount: z.coerce.number().optional(),
    taxAmount: z.coerce.number().optional(),
    creditDays: z.coerce.number().min(0, "Los días de crédito no pueden ser negativos"),
    notes: z.string().optional(),
});

type CreateNoteValues = z.infer<typeof createNoteSchema>;

interface CreateNoteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Función auxiliar para obtener la fecha LOCAL en formato YYYY-MM-DD
// Evita que toISOString() te dé el día siguiente si es de noche.
const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const CreateNoteDialog = ({ open, onOpenChange }: CreateNoteDialogProps) => {
    const { useCreateNote } = useAdminNotes();
    const createMutation = useCreateNote();

    const form = useForm<CreateNoteValues>({
        resolver: zodResolver(createNoteSchema) as any,
        defaultValues: {
            folio: "" as any,
            date: getLocalDateString(),
            weakClientId: "",
            totalAmount: "" as any,
            hasIva: false,
            subtotalAmount: 0,
            taxAmount: 0,
            creditDays: 30, // Default to 30 days
            notes: "",
        },
    });

    const hasIva = useWatch({ control: form.control, name: 'hasIva' });
    const totalAmount = useWatch({ control: form.control, name: 'totalAmount' });

    // Calculate subtotal and tax dynamically
    useEffect(() => {
        if (hasIva && totalAmount > 0) {
            const subtotal = totalAmount / 1.16;
            const tax = totalAmount - subtotal;
            form.setValue('subtotalAmount', Number(subtotal.toFixed(2)));
            form.setValue('taxAmount', Number(tax.toFixed(2)));
        } else {
            form.setValue('subtotalAmount', 0);
            form.setValue('taxAmount', 0);
        }
    }, [hasIva, totalAmount, form]);

    useEffect(() => {
        if (open) {
            form.reset({
                folio: "" as any,
                date: getLocalDateString(),
                weakClientId: "",
                totalAmount: "" as any,
                hasIva: false,
                subtotalAmount: 0,
                taxAmount: 0,
                creditDays: 30,
                notes: "",
            });
        }
    }, [open, form]);

    const handleSubmit = (values: CreateNoteValues) => {
        const payload = {
            folio: values.folio,
            // Solución: Anexamos T12:00:00.000Z para forzar el mediodía UTC 
            // y evitar que el desfase horario cambie el día en el backend.
            date: `${values.date}T12:00:00.000Z`,
            weakClientId: values.weakClientId,
            totalAmount: values.totalAmount,
            subtotalAmount: values.hasIva ? values.subtotalAmount : undefined,
            taxAmount: values.hasIva ? values.taxAmount : undefined,
            creditDays: values.creditDays,
            notes: values.notes,
        };

        createMutation.mutate(payload, {
            onSuccess: () => {
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Nota de Crédito</DialogTitle>
                    <DialogDescription>
                        Crea una nueva nota de crédito y asígnala a un cliente.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="folio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Folio</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Emisión</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="weakClientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente</FormLabel>
                                    <WeakClientSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="totalAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto Total ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="creditDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Días de Crédito</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="30" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="hasIva"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>La nota contiene IVA (16%)</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {hasIva && (
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md text-sm border">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold text-gray-900">${form.watch('subtotalAmount')?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>IVA:</span>
                                    <span className="font-semibold text-gray-900">${form.watch('taxAmount')?.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comentarios de la nota (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Observaciones extras..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={createMutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Registrar Nota
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};