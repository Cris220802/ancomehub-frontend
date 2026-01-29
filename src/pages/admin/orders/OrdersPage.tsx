import { useState } from "react";
import { useAdminOrders } from "@/pages/admin/hooks/useAdminOrders";
import { columns } from "./components/columns";
import { DataTable } from "@/components/ui/data-table";
import { CustomPagination } from "@/components/common/CustomPagination";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { OrderFilters, PaymentMethod } from "@/types/orders";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

export const OrdersPage = () => {
    // Estado local para filtros (igual que en ProductsPage)
    const [filters, setFilters] = useState<OrderFilters>({ limit: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { useOrders } = useAdminOrders();

    // Actualizar filtro de folio cuando cambia el search debounced
    useEffect(() => {
        setFilters(prev => ({ ...prev, folio: debouncedSearch, page: 1 }));
    }, [debouncedSearch]);

    // Pasamos los filtros al hook
    const { data: orders, isLoading, isError, refetch, isRefetching } = useOrders(filters);

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
                <h3 className="font-semibold text-lg">Error al cargar pedidos</h3>
                <p className="text-muted-foreground mb-4">No pudimos obtener la lista de pedidos. Intenta nuevamente.</p>
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
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Pedidos</h2>
                    <p className="text-muted-foreground">
                        Supervisa el flujo de ventas, valida pagos y actualiza el estatus de entrega.
                    </p>
                </div>
                {/* Aquí podrías poner un botón de "Exportar a Excel" si fuera necesario */}
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Search Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium whitespace-nowrap">Buscar:</span>
                    <Input
                        placeholder="Folio, ID o Cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-[300px]"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium whitespace-nowrap">Estatus:</span>
                    <Select
                        value={filters.status || "all"}
                        onValueChange={(val) => setFilters({
                            ...filters,
                            status: val === "all" ? undefined : val as any,
                            page: 1
                        })}
                    >
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Todos los estatus" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                            <SelectItem value="SHIPPED">Enviado</SelectItem>
                            <SelectItem value="DELIVERED">Entregado</SelectItem>
                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Filter (Placeholder visual) */}
                {/* Payment Method Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium whitespace-nowrap">Método:</span>
                    <Select
                        value={filters.paymentMethod || "all"}
                        onValueChange={(val) => setFilters({
                            ...filters,
                            paymentMethod: val === "all" ? undefined : val as PaymentMethod,
                            page: 1
                        })}
                    >
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Método de Pago" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="CASH">Efectivo</SelectItem>
                            <SelectItem value="TRANSFER">Transferencia</SelectItem>
                            <SelectItem value="CREDIT">Crédito</SelectItem>
                            <SelectItem value="CHECK">Cheque</SelectItem>
                            <SelectItem value="DEPOSIT">Depósito</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium whitespace-nowrap">Desde:</span>
                    <Input
                        type="date"
                        className="w-full md:w-[150px]"
                        value={filters.dateFrom || ''}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium whitespace-nowrap">Hasta:</span>
                    <Input
                        type="date"
                        className="w-full md:w-[150px]"
                        value={filters.dateTo || ''}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
                    />
                </div>

                {isRefetching && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
                )}
            </div>

            {/* Data Table */}
            {/* Quitamos el contenedor bg-white extra para alinearlo con ProductsPage que usa DataTable directo */}
            <DataTable columns={columns} data={orders?.items || []} />

            {/* Pagination Controls */}
            <CustomPagination
                meta={orders?.meta}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                isLoading={isRefetching || isLoading}
            />
        </div>
    );
};