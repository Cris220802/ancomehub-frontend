import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAdminWeakClient } from "@/pages/admin/hooks/useAdminWeakClient";
import { columns } from "./components/columns";
import { CreateWeakClientDialog } from "./components/CreateWeakClientDialog";
import { DataTable } from "@/components/ui/data-table";
import { CustomPagination } from "@/components/common/CustomPagination";
import { Loader2, AlertCircle, RefreshCw, UserPlus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FilterWeakClientDto } from "@/types/note";
import { useDebounce } from "@/hooks/useDebounce";

export const WeakClientsPage = () => {
    // Estado local para filtros
    const [filters, setFilters] = useState<FilterWeakClientDto>({ limit: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { useWeakClients, useCreateWeakClient } = useAdminWeakClient();

    // Queries
    const { data: clientsResp, isLoading, isError, refetch, isRefetching } = useWeakClients(filters);
    const createMutation = useCreateWeakClient();

    // Filter sync
    useEffect(() => {
        setFilters(prev => ({ ...prev, name: debouncedSearch, page: 1 }));
    }, [debouncedSearch]);


    const handleCreateClient = (data: any) => {
        const payload = {
            name: data.name,
            email: data.email || undefined,
            phone: data.phone || undefined,
        };
        createMutation.mutate(payload, {
            onSuccess: () => {
                setCreateDialogOpen(false);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4 flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="font-semibold text-lg">Error al cargar clientes</h3>
                <p className="text-muted-foreground mb-4">No pudimos obtener la lista de clientes. Intenta nuevamente.</p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4">
                    <Link to="/admin/notes">
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Directorio de Clientes (Notas de Crédito)</h2>
                        <p className="text-muted-foreground">
                            Gestiona el catálogo de clientes con los cuales mantienes cuentas por cobrar mediante Notas de Crédito.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4 pb-4 border-b">
                    {/* Search Filter */}
                    <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                        <Input
                            placeholder="Buscar por Nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:max-w-md"
                        />
                    </div>

                    <div className="flex items-center gap-2 ml-auto shrink-0 w-full md:w-auto">
                        {isRefetching && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                        )}
                        <Button onClick={() => setCreateDialogOpen(true)} className="w-full md:w-auto">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Registrar Cliente
                        </Button>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable columns={columns} data={clientsResp?.items || []} />

                {/* Pagination Controls */}
                <CustomPagination
                    meta={clientsResp?.meta}
                    onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                    isLoading={isRefetching || isLoading}
                />
            </div>

            <CreateWeakClientDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateClient}
                isPending={createMutation.isPending}
            />
        </div>
    );
};
