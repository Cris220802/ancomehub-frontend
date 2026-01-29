
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RegisterShipmentDto } from '@/types/orders';
import { Loader2, Package } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShipmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderItems: any[];
    onConfirm: (data: RegisterShipmentDto) => void;
    isPending?: boolean;
}

const formSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(0),
        selected: z.boolean(),
        maxQuantity: z.number(), // allocated
        productName: z.string(),
        sku: z.string(),
        imageUrl: z.string().optional(),
    })).refine((items) => items.some(item => item.selected && item.quantity > 0), {
        message: "Selecciona al menos un ítem con cantidad válida para enviar.",
        path: ["root"] // Error global
    })
});

type FormValues = z.infer<typeof formSchema>;

export const ShipmentDialog = ({ open, onOpenChange, orderItems, onConfirm, isPending }: ShipmentDialogProps) => {
    // Filtrar items que tienen algo apartado (quantityAllocated > 0)
    const deliverableItems = orderItems.filter(item => (item.quantityAllocated || 0) > 0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            items: deliverableItems.map(item => ({
                productId: item.productId,
                quantity: item.quantityAllocated,
                selected: true,
                maxQuantity: item.quantityAllocated,
                productName: item.productName,
                sku: item.sku,
                imageUrl: item.imageUrl
            }))
        }
    });

    // Resetear form cuando se abre o cambian los items
    useEffect(() => {
        if (open) {
            form.reset({
                items: deliverableItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantityAllocated,
                    selected: true,
                    maxQuantity: item.quantityAllocated,
                    productName: item.productName,
                    sku: item.sku,
                    imageUrl: item.imageUrl
                }))
            });
        }
    }, [open, orderItems, form]);

    const items = form.watch('items');
    const allSelected = items?.length > 0 && items.every(i => i.selected);

    const toggleSelectAll = () => {
        const newValue = !allSelected;
        const currentItems = form.getValues('items');
        currentItems.forEach((_, index) => {
            form.setValue(`items.${index}.selected`, newValue);
        });
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const shipmentData: RegisterShipmentDto = {
            items: values.items
                .filter(item => item.selected && item.quantity > 0)
                .map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
        };
        onConfirm(shipmentData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Registrar Envío</DialogTitle>
                    <DialogDescription>
                        Selecciona los productos y cantidades que vas a enviar de la mercancía apartada.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Header de la Tabla */}
                        <div className="flex items-center space-x-2 border-b pb-2 mb-2">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                aria-label="Select all"
                            />
                            <span className="text-sm font-medium text-gray-500 w-full pl-2">Seleccionar Todo ({items?.length || 0} ítems listos)</span>
                        </div>

                        <ScrollArea className="max-h-[300px] pr-4">
                            <div className="space-y-3">
                                {form.getValues('items').map((item, index) => (
                                    <div key={item.productId} className={`flex items-center space-x-3 p-3 rounded border transition-colors ${form.watch(`items.${index}.selected`) ? 'bg-blue-50 border-blue-100' : 'bg-white'}`}>

                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.selected`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value}
                                                            onChange={field.onChange}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="h-10 w-10 shrink-0 bg-white border rounded p-0.5">
                                            <img src={getImageUrl(item.imageUrl)} alt="" className="w-full h-full object-contain" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{item.sku}</p>
                                        </div>

                                        {/* Quantity Input */}
                                        <div className="w-24 text-right">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <div className="flex flex-col items-end">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    className="h-8 text-right pr-2"
                                                                    min={0}
                                                                    max={item.maxQuantity}
                                                                    disabled={!form.watch(`items.${index}.selected`)}
                                                                    {...field}
                                                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <span className="text-[10px] text-gray-400 mt-1">
                                                                Max: {item.maxQuantity}
                                                            </span>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {form.formState.errors.root && (
                            <p className="text-sm text-red-500 text-center">{form.formState.errors.root.message}</p>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar y Enviar Stock
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
