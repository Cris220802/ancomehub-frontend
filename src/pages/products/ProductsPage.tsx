import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { useProducts } from "./hooks/useProducts"
import { useCategories } from "../categories/hooks/useCategories"
import { ProductForm } from "./components/ProductForm"
import { getColumns } from "./components/columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/Input"
import { CreateProductDto, Product, ProductAdmin, UpdateProductDto } from "../../types/products"
import { CustomPagination } from "@/components/common/CustomPagination"

export const ProductsPage = () => {
    const {
        products,
        meta,
        isLoading,
        filters,
        setFilters,
        createMutation,
        updateMutation,
        deleteMutation,
        toggleStatusMutation,
        searchId,
        setSearchId
    } = useProducts();

    // We also need categories for the filter
    const { categories } = useCategories();

    // State management
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductAdmin | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<ProductAdmin | null>(null);

    // Debounce for Product Name input
    const [productNameInput, setProductNameInput] = useState(filters.productName || '');
    const debouncedProductName = useDebounce(productNameInput, 500);

    // Sync debounce
    useEffect(() => {
        setFilters(prev => ({ ...prev, productName: debouncedProductName, page: 1 }));
    }, [debouncedProductName]);

    // Handlers
    const handleCreate = async (data: CreateProductDto) => {
        try {
            await createMutation.mutateAsync(data);
            setIsDialogOpen(false);
            toast.success("Producto creado correctamente");
        } catch (error) {
            console.error("Failed to create product", error);
            toast.error("Error al crear el producto");
        }
    };

    const handleUpdate = async (data: UpdateProductDto) => {
        if (!editingProduct) return;
        try {
            await updateMutation.mutateAsync({ id: editingProduct.id, data });
            setIsDialogOpen(false);
            setEditingProduct(null);
            toast.success("Producto actualizado correctamente");
        } catch (error) {
            console.error("Failed to update product", error);
            toast.error("Error al actualizar el producto");
        }
    };

    const handleDelete = async () => {
        if (!deleteProduct) return;
        try {
            await deleteMutation.mutateAsync(deleteProduct.id);
            setDeleteProduct(null);
            toast.success("Producto eliminado correctamente");
        } catch (error) {
            console.error("Failed to delete product", error);
            toast.error("Error al eliminar el producto");
        }
    };

    const handleToggleStatus = async (product: ProductAdmin) => {
        const action = product.isActive ? 'desactivate' : 'activate';
        try {
            await toggleStatusMutation.mutateAsync({ id: product.id, action });
            toast.success(`Producto ${product.isActive ? 'desactivado' : 'activado'} correctamente`);
        } catch (error) {
            console.error("Failed to toggle status", error);
            toast.error("Error al cambiar el estado del producto");
        }
    }

    const openCreateDialog = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (product: ProductAdmin) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const columns = getColumns({
        onEdit: openEditDialog,
        onDelete: (product) => setDeleteProduct(product),
        onToggleStatus: handleToggleStatus
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-64 w-full bg-gray-100 rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
                    <p className="text-muted-foreground">
                        Gestiona el catálogo de productos, precios y stock.
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="bg-primary hover:bg-yellow-500 text-gray-900 border-none">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Buscar por Nombre:</span>
                    <Input
                        placeholder="Nombre del producto..."
                        value={productNameInput}
                        onChange={(e) => setProductNameInput(e.target.value)}
                        className="w-[300px]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Categoría:</span>
                    <Select
                        value={filters.categoryId || "all"}
                        onValueChange={(val) => setFilters({ ...filters, categoryId: val === "all" ? undefined : val })}
                        disabled={!!searchId} // Disable category filter if searching by ID
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Estado:</span>
                    <Select
                        value={filters.isActive === undefined ? "all" : filters.isActive ? "true" : "false"}
                        onValueChange={(val) => {
                            const isActive = val === "all" ? undefined : val === "true";
                            setFilters({ ...filters, isActive, page: 1 });
                        }}
                        disabled={!!searchId}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="true">Activos</SelectItem>
                            <SelectItem value="false">Desactivados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataTable columns={columns} data={products as ProductAdmin[]} />

            <CustomPagination
                meta={meta}
                onPageChange={(page) => setFilters({ ...filters, page })}
                isLoading={isLoading}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) setEditingProduct(null);
                setIsDialogOpen(open);
            }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? 'Modifica los datos del producto.' : 'Ingresa los detalles para el nuevo producto.'}
                        </DialogDescription>
                    </DialogHeader>

                    <ProductForm
                        defaultValues={editingProduct || undefined}
                        onSubmit={(data) => {
                            if (editingProduct) {
                                handleUpdate(data as UpdateProductDto);
                            } else {
                                handleCreate(data as CreateProductDto);
                            }
                        }}
                        isSubmitting={isSubmitting}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el producto
                            <span className="font-bold text-gray-900"> {deleteProduct?.name} </span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
