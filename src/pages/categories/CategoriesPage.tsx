import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { useCategories } from "./hooks/useCategories"
import { CategoryForm } from "./components/CategoryForm"
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
import { Category, CreateCategoryDto } from "../../types/categories"

export const CategoriesPage = () => {
    const { categories, isLoading, createMutation, updateMutation, deleteMutation } = useCategories();

    // State management
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

    // Handlers
    const handleCreate = async (data: CreateCategoryDto) => {
        try {
            await createMutation.mutateAsync(data);
            setIsDialogOpen(false);
            toast.success("Categoría creada correctamente");
        } catch (error) {
            console.error("Failed to create category", error);
            toast.error("Error al crear la categoría");
        }
    };

    const handleUpdate = async (data: CreateCategoryDto) => {
        if (!editingCategory) return;
        try {
            await updateMutation.mutateAsync({ id: editingCategory.id, data });
            setIsDialogOpen(false);
            setEditingCategory(null);
            toast.success("Categoría actualizada correctamente");
        } catch (error) {
            console.error("Failed to update category", error);
            toast.error("Error al actualizar la categoría");
        }
    };

    const handleDelete = async () => {
        if (!deleteCategory) return;
        try {
            await deleteMutation.mutateAsync(deleteCategory.id);
            setDeleteCategory(null);
            toast.success("Categoría eliminada correctamente");
        } catch (error) {
            console.error("Failed to delete category", error);
            toast.error("Error al eliminar la categoría");
        }
    };

    const openCreateDialog = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const columns = getColumns({
        onEdit: openEditDialog,
        onDelete: (category) => setDeleteCategory(category),
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    if (isLoading) {
        // Simple loading state
        return (
            <div className="p-8 space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-64 w-full bg-gray-100 rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
                    <p className="text-muted-foreground">
                        Gestiona las categorías de productos de tu catálogo.
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoría
                </Button>
            </div>

            <DataTable columns={columns} data={categories} />

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) setEditingCategory(null);
                setIsDialogOpen(open);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Modifica los datos de la categoría.' : 'Ingresa los datos para la nueva categoría.'}
                        </DialogDescription>
                    </DialogHeader>

                    <CategoryForm
                        defaultValues={editingCategory || undefined}
                        onSubmit={editingCategory ? handleUpdate : handleCreate}
                        isSubmitting={isSubmitting}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deleteCategory} onOpenChange={(open) => !open && setDeleteCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría
                            <span className="font-bold text-gray-900"> {deleteCategory?.name} </span>
                            y podría afectar a los productos asociados.
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
