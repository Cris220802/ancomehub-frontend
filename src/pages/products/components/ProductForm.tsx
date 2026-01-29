import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateProductDto, Product } from '../../../types/products';
import { useCategories } from '../../categories/hooks/useCategories';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getImageUrl } from '@/lib/utils';
import { FileIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// 1. Schema (Sin cambios)
const formSchema = z.object({
    sku: z.string().min(1, 'El SKU es requerido'),
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    basePrice: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
    stock: z.coerce.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
    leadTimeDays: z.coerce.number().int().min(0, 'El tiempo de entrega debe ser positivo'),
    allowBackorder: z.boolean().default(false),
    maxBackorder: z.coerce.number().min(0, 'El máximo de backorder debe ser mayor o igual a 0').optional(),
    categoryId: z.string().uuid('Selecciona una categoría válida'),
    image: z.any().optional(),
    datasheet: z.any().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
    defaultValues?: Product;
    onSubmit: (data: CreateProductDto) => void;
    isSubmitting: boolean;
    onCancel?: () => void;
}

export const ProductForm = ({ defaultValues, onSubmit, isSubmitting, onCancel }: ProductFormProps) => {
    const { categories } = useCategories();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // 2. useForm sin genérico explícito (para evitar conflicto de tipos)
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sku: '',
            name: '',
            description: '',
            basePrice: 0,
            stock: 0,
            leadTimeDays: 0,
            allowBackorder: false,
            maxBackorder: 0,
            categoryId: '',
        },
    });

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                sku: defaultValues.sku,
                name: defaultValues.name,
                description: defaultValues.description || '',
                basePrice: defaultValues.basePrice,
                stock: defaultValues.stock,
                leadTimeDays: defaultValues.leadTimeDays,
                allowBackorder: defaultValues.allowBackorder || false,
                maxBackorder: defaultValues.maxBackorder,
                categoryId: defaultValues.category?.id || '',
            });
            if (defaultValues.imageUrl) {
                setImagePreview(defaultValues.imageUrl);
            }
        } else {
            form.reset({
                sku: '',
                name: '',
                description: '',
                basePrice: 0,
                stock: 0,
                leadTimeDays: 0,
                allowBackorder: false,
                maxBackorder: 0,
                categoryId: '',
            });
            setImagePreview(null);
        }
    }, [defaultValues, form]);

    const handleSubmit = (data: ProductFormValues) => {
        const productDto: CreateProductDto = {
            ...data,
            description: data.description || '',
            image: (data.image instanceof FileList && data.image.length > 0) ? data.image[0] : undefined,
            datasheet: (data.datasheet instanceof FileList && data.datasheet.length > 0) ? data.datasheet[0] : undefined,
        };
        onSubmit(productDto);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    {/* CORRECCIÓN: Castear field.value a string */}
                                    <Input
                                        placeholder="COD-001"
                                        {...field}
                                        value={field.value as string ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    {/* CORRECCIÓN */}
                                    <Input
                                        placeholder="Nombre del producto"
                                        {...field}
                                        value={field.value as string ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                {/* CORRECCIÓN */}
                                <Textarea
                                    placeholder="Descripción detallada..."
                                    {...field}
                                    value={field.value as string ?? ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Precio Base ($)</FormLabel>
                                <FormControl>
                                    {/* CORRECCIÓN: Castear a number o string */}
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        value={field.value as number ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {!defaultValues && (
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                        {/* CORRECCIÓN */}
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value as number ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="leadTimeDays"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tiempo Entrega (Días)</FormLabel>
                                <FormControl>
                                    {/* CORRECCIÓN */}
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value as number ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="allowBackorder"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Permitir Backorder</FormLabel>
                                    <div className="text-sm text-muted-foreground">
                                        Permitir ventas sin stock disponible
                                    </div>
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

                    {form.watch('allowBackorder') && (
                        <FormField
                            control={form.control}
                            name="maxBackorder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Máximo Backorder</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value as number ?? ''}
                                            placeholder="0 para ilimitado"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            {/* CORRECCIÓN: El Select maneja su propio value como string */}
                            <Select
                                onValueChange={field.onChange}
                                value={field.value as string}
                                defaultValue={field.value as string}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Image Upload */}
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Imagen del Producto</FormLabel>
                            <div className="flex items-center gap-4">
                                {imagePreview && (
                                    <div className="h-16 w-16 rounded border overflow-hidden shrink-0">
                                        {
                                            defaultValues?.imageUrl ? (
                                                <img src={getImageUrl(defaultValues.imageUrl)} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                            )
                                        }
                                    </div>
                                )}
                                <FormControl>
                                    <Input
                                        {...fieldProps}
                                        type="file"
                                        accept="image/*"
                                        // Importante: No pasamos 'value' al input file
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            if (files && files.length > 0) {
                                                onChange(files);
                                                const reader = new FileReader();
                                                reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                                                reader.readAsDataURL(files[0]);
                                            }
                                        }}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Datasheet Upload */}
                <FormField
                    control={form.control}
                    name="datasheet"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Hoja de datos</FormLabel>
                            {
                                defaultValues?.datasheetUrl && (
                                    <div className="h-16 w-16 rounded border overflow-hidden shrink-0">
                                        <a href={getImageUrl(defaultValues.datasheetUrl)} target="_blank" rel="noopener noreferrer">
                                            <FileIcon className="h-16 w-16" />
                                        </a>
                                    </div>
                                )
                            }
                            <div className="flex items-center gap-4">
                                <FormControl>
                                    <Input
                                        {...fieldProps}
                                        type="file"
                                        accept="application/pdf"
                                        // Importante: No pasamos 'value' al input file
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            if (files && files.length > 0) {
                                                onChange(files);
                                            }
                                        }}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};