
import { useEffect } from 'react';
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
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { useWarehouses } from '@/pages/admin/hooks/useAdminWarehouse';
import { useProducts } from '@/pages/products/hooks/useProducts'; // Asumiendo ruta correcta
import { CreateMovementDto, MovementType, Warehouse } from '@/types/warehouse';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const movementTypes = [
    { value: MovementType.IN_PURCHASE, label: 'Entrada - Compra' },
    { value: MovementType.IN_ADJUSTMENT, label: 'Entrada - Ajuste' },
    // { value: MovementType.IN_TRANSFER, label: 'Entrada - Transferencia' }, // Complejidad extra, omitir por ahora si no es requerido explícitamente en UI
    { value: MovementType.OUT_SALE, label: 'Salida - Venta' },
    { value: MovementType.OUT_ADJUSTMENT, label: 'Salida - Ajuste' },
];

const formSchema = z.object({
    warehouseId: z.string().min(1, 'Selecciona un almacén'),
    type: z.nativeEnum(MovementType, { message: 'Selecciona el tipo de movimiento' }),
    reference: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().min(1, 'Producto requerido'),
        quantity: z.number().min(1, 'Cantidad debe ser mayor a 0')
    })).min(1, 'Agrega al menos un producto'),
});

type FormValues = z.infer<typeof formSchema>;

interface MovementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouses: Warehouse[];
    defaultWarehouseId?: string;
}

export const MovementDialog = ({ open, onOpenChange, warehouses, defaultWarehouseId }: MovementDialogProps) => {
    const { useCreateMovement } = useWarehouses();
    const createMovementMutation = useCreateMovement();

    // Obtener productos para el selector
    // Nota: findAllAdmin podría necesitar paginación real, aquí asumimos que trae suficientes o implementamos búsqueda.
    // Para simplificar V1, cargamos los primeros 100 o similar.
    const { products, setFilters } = useProducts();

    useEffect(() => {
        // Asegurar cargar suficientes productos para el selector
        setFilters({ limit: 100, page: 1 });
    }, [setFilters]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            warehouseId: defaultWarehouseId || '',
            // type: undefined,
            reference: '',
            notes: '',
            items: [{ productId: '', quantity: 1 }]
        },
    });

    // Actualizar warehouseId si cambia el default y el form está "pristine" en ese campo
    useEffect(() => {
        if (defaultWarehouseId && !form.getValues('warehouseId')) {
            form.setValue('warehouseId', defaultWarehouseId);
        }
    }, [defaultWarehouseId, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const onSubmit = (values: FormValues) => {
        createMovementMutation.mutate(values as CreateMovementDto, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset({
                    warehouseId: defaultWarehouseId || '',
                    reference: '',
                    notes: '',
                    items: [{ productId: '', quantity: 1 }]
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
                    <DialogDescription>
                        Entradas, salidas o ajustes de stock manuales.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col min-h-0">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="warehouseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Almacén</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona almacén" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouses.map((w) => (
                                                    <SelectItem key={w.id} value={w.id}>
                                                        {w.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Movimiento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {movementTypes.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Referencia (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Factura A-123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Espacio reservado para fecha futura si se requiere */}
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Detalles adicionales del movimiento..." className="resize-none h-20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator className="my-2" />

                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Productos</h4>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ productId: '', quantity: 1 })}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Agregar Item
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 -mx-6 px-6 max-h-[240px]">
                            <div className="space-y-3 p-1">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-start">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.productId`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    className={cn(
                                                                        "w-full justify-between font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value
                                                                        ? products.find((p) => p.id === field.value)?.name
                                                                        : "Seleccionar producto"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[400px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Buscar producto..." />
                                                                <CommandList>
                                                                    <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {products.map((product) => (
                                                                            <CommandItem
                                                                                key={product.id}
                                                                                value={product.name} // Filter by name
                                                                                onSelect={() => {
                                                                                    field.onChange(product.id);
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        product.id === field.value
                                                                                            ? "opacity-100"
                                                                                            : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                <div className="flex flex-col">
                                                                                    <span>{product.name}</span>
                                                                                    <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                                                                                </div>
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <DialogFooter className="mt-auto pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMovementMutation.isPending}>
                                {createMovementMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Registrar Movimiento
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
