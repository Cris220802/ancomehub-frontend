import { useState, useEffect } from 'react';
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/Button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Plus, Search, X } from 'lucide-react';
import { useAdminPriceLists } from '../../hooks/useAdminPriceLists';
import { PriceListItem } from '@/types/pricing';
import { useProducts } from '@/pages/products/hooks/useProducts';
import { CustomPagination } from '@/components/common/CustomPagination';
import { getImageUrl, formatCurrency, cn } from '@/lib/utils';

// 1. Validación actualizada: Valor debe ser mayor a 0
const formSchema = z.object({
    productId: z.string().min(1, "Selecciona un producto"),
    type: z.enum(["FIXED", "DISCOUNT"]),
    value: z.number({ error: "Ingresa un número válido" })
        .gt(0, "El valor debe ser mayor a 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface UpsertPriceListItemDialogProps {
    listId: string;
    existingItem?: PriceListItem;
    trigger?: React.ReactNode;
}

export function UpsertPriceListItemDialog({ listId, existingItem, trigger }: UpsertPriceListItemDialogProps) {
    const [open, setOpen] = useState(false);
    const { useUpsertPriceListItem } = useAdminPriceLists();
    const upsertMutation = useUpsertPriceListItem();

    // Product Search State
    const { products, meta, isLoading: isLoadingProducts, setFilters, filters } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // 2. Agregamos mode: 'onChange' para que el botón se habilite/deshabilite en tiempo real
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            productId: existingItem?.product?.id || '',
            type: existingItem?.fixedPrice !== null && existingItem?.fixedPrice !== undefined ? 'FIXED' : 'DISCOUNT',
            value: existingItem?.fixedPrice ?? existingItem?.discountPercent ?? 0,
        },
    });

    // Reset del formulario al abrir/cerrar o cambiar el item
    useEffect(() => {
        if (open) {
            if (existingItem) {
                // Pre-llenado para EDICIÓN
                form.reset({
                    productId: existingItem.product?.id || '',
                    type: existingItem.fixedPrice !== null && existingItem.fixedPrice !== undefined ? 'FIXED' : 'DISCOUNT',
                    value: existingItem?.fixedPrice ?? existingItem?.discountPercent ?? 0,
                });
                form.trigger(); // Trigger validation to ensure isValid is updated

                if (existingItem.product) {
                    setSelectedProduct(existingItem.product);
                }
            } else {
                // Reset para CREACIÓN
                form.reset({
                    productId: '',
                    type: 'FIXED',
                    value: 0,
                });
                setSelectedProduct(null);
                setSearchTerm('');
            }
        }
    }, [open, existingItem, form]);

    // Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (open) { // Solo buscar si el modal está abierto
                setFilters({ ...filters, page: 1, productName: searchTerm });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, open]);

    const onSubmit = (values: FormValues) => {
        const dto = {
            priceListId: listId,
            productId: values.productId,
            fixedPrice: values.type === 'FIXED' ? values.value : undefined,
            discountPercent: values.type === 'DISCOUNT' ? values.value : undefined,
        };

        upsertMutation.mutate(dto, {
            onSuccess: () => {
                setOpen(false);
                // No reseteamos inmediatamente aquí para evitar parpadeos visuales antes de que cierre
            },
        });
    };

    const handleSelectProduct = (product: any) => {
        setSelectedProduct(product);
        form.setValue('productId', product.id, { shouldValidate: true }); // shouldValidate activa el botón
    };

    const handleClearProduct = () => {
        setSelectedProduct(null);
        form.setValue('productId', '', { shouldValidate: true });
    };

    const watchType = form.watch('type');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Agregar Regla
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{existingItem ? 'Editar Regla de Precio' : 'Nueva Regla de Precio'}</DialogTitle>
                    <DialogDescription>
                        Define un precio fijo o un descuento para un producto específico.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 px-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">

                            {/* PRODUCT SELECTION */}
                            <div className="space-y-3">
                                <FormLabel className={form.formState.errors.productId ? "text-red-500" : ""}>
                                    Producto {selectedProduct && <span className="font-normal text-muted-foreground">- Seleccionado</span>}
                                </FormLabel>

                                {selectedProduct ? (
                                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 relative animate-in fade-in zoom-in-95 duration-200">
                                        <div className="h-12 w-12 bg-white rounded border overflow-hidden shrink-0">
                                            <img
                                                src={getImageUrl(selectedProduct.imageUrl)}
                                                alt=""
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{selectedProduct.name}</p>
                                            <p className="text-xs text-muted-foreground">SKU: {selectedProduct.sku}</p>
                                        </div>
                                        {/* Permitir cambiar producto incluso en edición si lo deseas, si no, oculta este botón si existingItem existe */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                            onClick={handleClearProduct}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border rounded-lg p-3 space-y-3 bg-white">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por nombre o SKU..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>

                                        <div className="space-y-2 h-[200px] overflow-y-auto custom-scrollbar">
                                            {isLoadingProducts ? (
                                                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-300" /></div>
                                            ) : products.length === 0 ? (
                                                <div className="text-center py-8 text-sm text-gray-500">No se encontraron productos</div>
                                            ) : (
                                                products.map((product: any) => (
                                                    <div
                                                        key={product.id}
                                                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                                                        onClick={() => handleSelectProduct(product)}
                                                    >
                                                        <div className="h-10 w-10 bg-white rounded border overflow-hidden shrink-0">
                                                            <img
                                                                src={getImageUrl(product.imageUrl)}
                                                                alt=""
                                                                className="h-full w-full object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{product.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                SKU: {product.sku} | Base: {formatCurrency(product.basePrice)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <CustomPagination
                                            meta={meta}
                                            onPageChange={(page) => setFilters({ ...filters, page })}
                                            className="pt-2 justify-center"
                                        />
                                    </div>
                                )}
                                <FormMessage>{form.formState.errors.productId?.message}</FormMessage>
                            </div>

                            {/* TYPE & VALUE */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Tipo de Ajuste</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                        <FormControl>
                                                            <RadioGroupItem value="FIXED" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer flex-1 text-sm">
                                                            Precio Fijo <span className="text-xs text-muted-foreground block">Sobrescribe el precio base</span>
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                                        <FormControl>
                                                            <RadioGroupItem value="DISCOUNT" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer flex-1 text-sm">
                                                            Descuento <span className="text-xs text-muted-foreground block">Porcentaje sobre base</span>
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {watchType === 'FIXED' ? 'Precio Final ($)' : 'Porcentaje (%)'}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-medium">
                                                        {watchType === 'FIXED' ? '$' : '%'}
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        step={watchType === 'FIXED' ? "0.01" : "1"}
                                                        placeholder="0.00"
                                                        className="pl-8 text-lg font-medium"
                                                        value={field.value || ''} // Manejo seguro de 0 o vacío
                                                        onChange={e => {
                                                            // Convertir a float si hay valor, sino pasar undefined/0 para evitar NaN
                                                            const val = parseFloat(e.target.value);
                                                            field.onChange(isNaN(val) ? 0 : val);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                            {watchType === 'DISCOUNT' && field.value > 0 && field.value < 100 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Se aplicará un {field.value}% de descuento.
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="pt-4 border-t mt-4">
                                <Button
                                    type="submit"
                                    // 3. Lógica arreglada: Se deshabilita si está cargando O si el formulario NO es válido
                                    disabled={upsertMutation.isPending || !form.formState.isValid}
                                >
                                    {upsertMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {existingItem ? 'Guardar Cambios' : 'Crear Regla'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}