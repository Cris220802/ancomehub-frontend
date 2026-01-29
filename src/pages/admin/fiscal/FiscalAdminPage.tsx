import { useState, useEffect } from 'react';
import { useAdminFiscal } from '../hooks/useAdminFiscal';
import { FiscalStatus } from '@/types/fiscal';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { columns } from './components/columns';
import { CustomPagination } from '@/components/common/CustomPagination';
import { ExternalInvoiceDialog } from './components/ExternalInvoiceDialog';
import { FilePlus, Loader2, AlertCircle, RefreshCw, Filter, X, ArrowRight, Receipt, ShoppingBag } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

// Interfaz local para manejar el estado de los filtros
interface FiscalFiltersState {
    page: number;
    limit: number;
    fiscalUuid?: string;
    status?: FiscalStatus;
    clientId?: string;
    orderId?: string;
    id?: string;
    dateFrom?: string;
    dateTo?: string;
}

const initialFilters: FiscalFiltersState = {
    page: 1,
    limit: 10,
    fiscalUuid: undefined,
    status: undefined,
    clientId: undefined,
    orderId: undefined,
    id: undefined,
    dateFrom: undefined,
    dateTo: undefined,
};

export const FiscalAdminPage = () => {
    // --- ESTADO ---
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [filters, setFilters] = useState<FiscalFiltersState>(initialFilters);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [externalInvoiceOpen, setExternalInvoiceOpen] = useState(false);
    const [pendingOrdersPage, setPendingOrdersPage] = useState(1);

    // Sincronizar búsqueda rápida (UUID/Folio) con debouncedSearch
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            fiscalUuid: debouncedSearch || undefined,
            page: 1
        }));
    }, [debouncedSearch]);

    // --- HOOKS ---
    const { useFiscalDocuments, usePendingInvoicingOrders } = useAdminFiscal();
    const { data, isLoading, isError, refetch, isRefetching } = useFiscalDocuments(filters);
    const { data: pendingOrders, isLoading: loadingPending } = usePendingInvoicingOrders(pendingOrdersPage, 5);
    // Helpers
    const handleFilterChange = (key: keyof FiscalFiltersState, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === "ALL" || value === "" ? undefined : value,
            page: 1
        }));
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        setSearchTerm('');
    };

    // --- COLUMNAS ---
    // Importado de ./components/columns.tsx

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-64 w-full bg-gray-100 rounded animate-pulse"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-96">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="font-semibold text-lg">Error al cargar documentos</h3>
                <p className="text-muted-foreground mb-4">No pudimos obtener la lista fiscal. Intenta nuevamente.</p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión Fiscal</h2>
                    <p className="text-muted-foreground">
                        Administra facturas, complementos de pago y notas de crédito.
                    </p>
                </div>
                <Button onClick={() => setExternalInvoiceOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <FilePlus className="mr-2 h-4 w-4" /> Nueva Factura Externa
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Columna Izquierda: Tabla de Facturas (col-8) */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* --- PANEL DE FILTROS --- */}
                    <div className="space-y-0 mb-0">

                        {/* Fila 1: Filtros Principales */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Búsqueda (UUID/Folio) */}
                            <div className="flex-1 min-w-[200px]">
                                <Label className="text-xs mb-1.5 block text-gray-500">Buscar (Folio)</Label>
                                <Input
                                    placeholder="Ej: AN-100"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white"
                                />
                            </div>

                            {/* Filtro Estatus */}
                            <div className="w-full lg:w-[180px]">
                                <Label className="text-xs mb-1.5 block text-gray-500">Estatus</Label>
                                <Select
                                    value={filters.status || "ALL"}
                                    onValueChange={(val) => handleFilterChange('status', val)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todos</SelectItem>
                                        <SelectItem value="PENDING">Pendiente</SelectItem>
                                        <SelectItem value="PARTIALLY_PAID">Parcial</SelectItem>
                                        <SelectItem value="PAID">Pagado</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtro ID Cliente (Input simple por ahora) */}
                            <div className="w-full lg:w-[250px] ">
                                <Label className="text-xs mb-1.5 block text-gray-500">ID Cliente</Label>
                                <Input
                                    placeholder="UUID de cliente..."
                                    value={filters.clientId || ''}
                                    onChange={(e) => handleFilterChange('clientId', e.target.value)}
                                    className="bg-white"
                                />
                            </div>

                            {/* Toggle Avanzado */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    className="bg-white"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    {showAdvanced ? 'Menos' : 'Más Filtros'}
                                </Button>
                            </div>
                        </div>

                        {/* Fila 2: Filtros Avanzados (Colapsable) */}
                        {showAdvanced && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                <Separator className="mb-4" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                    {/* Rango de Fechas */}
                                    <div>
                                        <Label className="text-xs mb-1.5 block text-gray-500">Fecha Desde</Label>
                                        <Input
                                            type="date"
                                            className="bg-white"
                                            value={filters.dateFrom || ''}
                                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block text-gray-500">Fecha Hasta</Label>
                                        <Input
                                            type="date"
                                            className="bg-white"
                                            value={filters.dateTo || ''}
                                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        />
                                    </div>

                                    {/* IDs Específicos */}
                                    <div>
                                        <Label className="text-xs mb-1.5 block text-gray-500">ID Orden</Label>
                                        <Input
                                            placeholder="UUID de orden..."
                                            className="bg-white"
                                            value={filters.orderId || ''}
                                            onChange={(e) => handleFilterChange('orderId', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1.5 block text-gray-500">ID Documento</Label>
                                        <Input
                                            placeholder="UUID interno..."
                                            className="bg-white"
                                            value={filters.id || ''}
                                            onChange={(e) => handleFilterChange('id', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón Limpiar y Loader */}
                        <div className="flex justify-between items-center pt-2 min-h-[32px]">
                            <div className="flex-1">
                                {isRefetching && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 animate-pulse">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Actualizando lista...
                                    </span>
                                )}
                            </div>

                            {(filters.status || filters.clientId || filters.orderId || filters.dateFrom || filters.id || filters.fiscalUuid) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                                >
                                    <X className="h-3 w-3 mr-1" /> Limpiar filtros
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Data Table */}
                    <DataTable columns={columns} data={data?.items || []} />

                    {/* Pagination Controls */}
                    <CustomPagination
                        meta={data?.meta}
                        onPageChange={(page) => handleFilterChange('page', page)}
                        isLoading={isRefetching || isLoading}
                    />
                </div>

                {/* Columna Derecha: Pendientes de Facturar (col-4) */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <Card className="bg-yellow-50/50 border-yellow-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center text-yellow-800">
                                <Receipt className="h-4 w-4 mr-2" />
                                Pendientes de Facturar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pendingOrders && pendingOrders?.items?.length > 0 ? (
                                    pendingOrders.items.map((order: any) => (
                                        <Link
                                            key={order.id}
                                            to={`/admin/orders/${order.id}`}
                                            className="block group"
                                        >
                                            <div className="bg-white p-3 rounded-lg border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">#{order.folio}</span>
                                                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ${order.totalAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                        {order.user?.fullName?.[0] || 'C'}
                                                    </div>
                                                    <span className="truncate flex-1">{order.user?.fullName || 'Cliente'}</span>
                                                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No hay órdenes pendientes de facturación.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pending Orders Pagination */}
                            <CustomPagination
                                meta={pendingOrders?.meta}
                                onPageChange={setPendingOrdersPage}
                                isLoading={loadingPending}
                                className="pt-2"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ExternalInvoiceDialog open={externalInvoiceOpen} onOpenChange={setExternalInvoiceOpen} />
        </div>
    );
};