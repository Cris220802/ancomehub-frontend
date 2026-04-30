import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/pages/client/hooks/useOrders';
import { Button } from '@/components/ui/Button';
import {
    ShoppingBag,
    X,
    Search,
    CalendarDays,
    Filter,
    Inbox,
    FileText
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './components/columns';
import { Input } from '@/components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OrderFilters } from '@/types/orders';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

export const QuotesPage = () => {
    const { useQuotesList } = useOrders();

    // Default filters
    const [filters, setFilters] = useState<OrderFilters>({
        page: 1,
        limit: 10,
        folio: '',
        status: undefined,
        dateFrom: '',
        dateTo: '',
    });

    // Debounce for folio input
    const [folioInput, setFolioInput] = useState('');
    const debouncedFolio = useDebounce(folioInput, 500);

    // Sync debounce
    useEffect(() => {
        setFilters(prev => ({ ...prev, folio: debouncedFolio, page: 1 }));
    }, [debouncedFolio]);

    // Use isFetching to detect background updates (filtering), isLoading for initial load
    const { data: response, isLoading, isFetching, isError } = useQuotesList(filters);

    const isTableLoading = isLoading || isFetching;

    const handleFilterChange = (key: keyof OrderFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const clearFilters = () => {
        setFilters({ page: 1, limit: 10, folio: '', status: undefined, dateFrom: '', dateTo: '' });
        setFolioInput('');
    };

    const { items = [], meta } = response || {};
    const hasActiveFilters = folioInput || filters.status || filters.dateFrom || filters.dateTo;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in duration-500 space-y-8">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        Mis Cotizaciones
                    </h1>
                    <p className="text-muted-foreground mt-1 ml-1">
                        Consulta y gestiona tus cotizaciones pendientes.
                    </p>
                </div>
                <Link to="/">
                    <Button>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Nueva Cotización
                    </Button>
                </Link>
            </div>

            {/* FILTERS CARD */}
            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-3 border-b bg-gray-50/50">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                        <Filter className="h-4 w-4" /> Filtros de Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                        {/* Search Folio */}
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Buscar Folio</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Ej: QUO-2024-001"
                                    value={folioInput}
                                    onChange={(e) => setFolioInput(e.target.value)}
                                    className="pl-9 bg-white"
                                />
                            </div>
                        </div>

                        {/* Status Select */}
                        {/* Date Range */}
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-gray-400" /> Rango de Fechas
                            </label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    className="bg-white"
                                    value={filters.dateFrom || ''}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                />
                                <span className="text-gray-400">-</span>
                                <Input
                                    type="date"
                                    className="bg-white"
                                    value={filters.dateTo || ''}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Clear Button */}
                        <div className="md:col-span-1 flex items-end justify-end md:justify-start">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearFilters}
                                    className="text-muted-foreground hover:text-destructive h-10 w-10"
                                    title="Limpiar filtros"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* DATA CONTENT */}
            <div className="space-y-4">
                {isError ? (
                    <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-100">
                        Error al cargar las cotizaciones. Por favor intente más tarde.
                    </div>
                ) : (
                    <div className="relative min-h-[400px]">

                        {/* Loading Overlay / Skeleton */}
                        {isTableLoading && (
                            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col gap-4 p-4 animate-in fade-in">
                                <div className="space-y-4 w-full">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4">
                                            <Skeleton className="h-12 w-full rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div className={cn("rounded-md border bg-white shadow-sm overflow-hidden", isTableLoading && "opacity-50 pointer-events-none")}>
                            {items.length > 0 ? (
                                <DataTable columns={columns} data={items} />
                            ) : (
                                !isTableLoading && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                                            <Inbox className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">No se encontraron cotizaciones</h3>
                                        <p className="text-gray-500 max-w-sm mt-1">
                                            No hay resultados para los filtros seleccionados. Intenta ajustar tu búsqueda.
                                        </p>
                                        {hasActiveFilters && (
                                            <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
                                                Limpiar filtros
                                            </Button>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!isError && meta && meta.lastPage > 1 && (
                    <div className="flex justify-center pt-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(Math.max(1, (meta.page || 1) - 1))}
                                        className={cn(
                                            "cursor-pointer",
                                            meta.page === 1 || isTableLoading ? "pointer-events-none opacity-50" : ""
                                        )}
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <div className="flex items-center justify-center px-4 text-sm font-medium">
                                        Página {meta.page} de {meta.lastPage}
                                    </div>
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(Math.min(meta.lastPage, (meta.page || 1) + 1))}
                                        className={cn(
                                            "cursor-pointer",
                                            meta.page === meta.lastPage || isTableLoading ? "pointer-events-none opacity-50" : ""
                                        )}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};
