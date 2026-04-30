
import { useState, useEffect, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Warehouse,
    Plus,
    ArrowRightLeft,
    MapPin,
    Search,
    Loader2,
} from 'lucide-react';
import { useWarehouses } from '@/pages/admin/hooks/useAdminWarehouse';
import { useCategories } from '@/pages/categories/hooks/useCategories';
import { CreateWarehouseDialog } from './components/CreateWarehouseDialog';
import { MovementDialog } from './components/MovementDialog';
import { DataTable } from "@/components/ui/data-table";
import { CustomPagination } from '@/components/common/CustomPagination';
import { getColumns } from './components/columns';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { InventoryFilters } from '@/types/warehouse';

const DEFAULT_FILTERS: InventoryFilters = { page: 1, limit: 10 };

export const WarehousePage = () => {
    const { useGetWarehouses, useGetInventory } = useWarehouses();
    const { categories } = useCategories();

    // Estados
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_FILTERS);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [movementDialogOpen, setMovementDialogOpen] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Queries
    const warehousesQuery = useGetWarehouses();
    const inventoryQuery = useGetInventory(selectedWarehouseId, filters);

    // Generar las columnas dinámicamente
    const columns = useMemo(() => {
        return getColumns(selectedWarehouseId || '');
    }, [selectedWarehouseId]);

    // Efecto para seleccionar el primer almacén por defecto o el marcado como default
    useEffect(() => {
        if (warehousesQuery.data?.length && !selectedWarehouseId) {
            const defaultWarehouse = warehousesQuery.data.find(w => w.isDefault);
            setSelectedWarehouseId(defaultWarehouse?.id || warehousesQuery.data[0].id);
        }
    }, [warehousesQuery.data, selectedWarehouseId]);

    // Sincronizar búsqueda debounced con filtros (resetea a página 1)
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            productName: debouncedSearch || undefined,
            page: 1,
        }));
    }, [debouncedSearch]);

    // Resetear filtros y búsqueda al cambiar de almacén
    useEffect(() => {
        setSearchTerm('');
        setFilters(DEFAULT_FILTERS);
    }, [selectedWarehouseId]);

    const handleCategoryChange = (value: string) => {
        setFilters(prev => ({
            ...prev,
            categoryId: value === 'all' ? undefined : value,
            page: 1,
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    if (warehousesQuery.isLoading) {
        return (
            <div className="p-8 space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="h-[400px] w-full bg-gray-100 rounded animate-pulse md:col-span-1" />
                    <div className="h-[400px] w-full bg-gray-100 rounded animate-pulse md:col-span-3" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Almacenes</h2>
                    <p className="text-muted-foreground">
                        Control de inventario multi-almacén y movimientos.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setMovementDialogOpen(true)} variant="outline">
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Registrar Movimiento
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)} className="bg-primary hover:bg-yellow-500 text-gray-900 border-none">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Almacén
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LISTA DE ALMACENES (SIDEBAR) */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider mb-2">Almacenes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                        {warehousesQuery.data?.map((warehouse) => (
                            <div
                                key={warehouse.id}
                                onClick={() => setSelectedWarehouseId(warehouse.id)}
                                className={cn(
                                    "cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md",
                                    selectedWarehouseId === warehouse.id
                                        ? "bg-primary/5 border-primary ring-1 ring-primary"
                                        : "bg-white border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                                        <Warehouse className="h-5 w-5 text-gray-600" />
                                    </div>
                                    {warehouse.isDefault && (
                                        <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-100">
                                            Default
                                        </Badge>
                                    )}
                                </div>
                                <h4 className="font-semibold text-gray-900">{warehouse.name}</h4>
                                {warehouse.address && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{warehouse.address}</span>
                                    </div>
                                )}
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                    <span>ID: ...{warehouse.id.slice(-4)}</span>
                                    <span className={cn("inline-block w-2 H-2 rounded-full", warehouse.isActive ? "bg-green-500" : "bg-gray-300")} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INVENTARIO (MAIN CONTENT) */}
                <div className="lg:col-span-9 space-y-6">
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <CardTitle>Inventario Actual</CardTitle>
                                        <CardDescription>
                                            Stock disponible en <span className="font-medium text-gray-900">
                                                {warehousesQuery.data?.find(w => w.id === selectedWarehouseId)?.name || 'Selecciona un almacén'}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    {inventoryQuery.isFetching && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative w-full sm:flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Buscar producto por nombre..."
                                            className="pl-9 bg-white"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select
                                        value={filters.categoryId || 'all'}
                                        onValueChange={handleCategoryChange}
                                    >
                                        <SelectTrigger className="w-full sm:w-[220px] bg-white">
                                            <SelectValue placeholder="Todas las categorías" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las categorías</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DataTable columns={columns} data={inventoryQuery.data?.items || []} />
                            <div className="px-4">
                                <CustomPagination
                                    meta={inventoryQuery.data?.meta}
                                    onPageChange={handlePageChange}
                                    isLoading={inventoryQuery.isFetching}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* DIALOGS */}
            <CreateWarehouseDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            <MovementDialog
                open={movementDialogOpen}
                onOpenChange={setMovementDialogOpen}
                warehouses={warehousesQuery.data || []}
                defaultWarehouseId={selectedWarehouseId || undefined}
            />
        </div>
    );
};
