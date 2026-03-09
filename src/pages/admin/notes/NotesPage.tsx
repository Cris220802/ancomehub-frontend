import { useState, useEffect } from "react";
import { useAdminNotes } from "@/pages/admin/hooks/useAdminNotes";
import { Link } from "react-router-dom";
import { columns } from "./components/columns";
import { CreateNoteDialog } from "./components/CreateNoteDialog";
import { DataTable } from "@/components/ui/data-table";
import { CustomPagination } from "@/components/common/CustomPagination";
import { Loader2, AlertCircle, RefreshCw, CalendarOff, Users, PlusCircle, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { FilterNoteDto, NoteStatus } from "@/types/note";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const NotesPage = () => {
    // Estado local para filtros
    const [filters, setFilters] = useState<FilterNoteDto>({ limit: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { useNotes, useOverdueNotes, useMostOverdueClients } = useAdminNotes();

    // Queries
    const { data: notesResp, isLoading, isError, refetch, isRefetching } = useNotes(filters);
    const { data: overdueNotesResp, isLoading: loadingOverdue } = useOverdueNotes(1, 5);
    const { data: overdueClientsResp, isLoading: loadingClients } = useMostOverdueClients(1, 5);
    console.log(notesResp);
    // Filter sync
    useEffect(() => {
        setFilters(prev => ({ ...prev, folio: debouncedSearch, page: 1 }));
    }, [debouncedSearch]);


    if (isLoading) {
        return (
            <div className="p-8 space-y-4 flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-96">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="font-semibold text-lg">Error al cargar notas</h3>
                <p className="text-muted-foreground mb-4">No pudimos obtener la lista de notas. Intenta nuevamente.</p>
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
                    <h2 className="text-3xl font-bold tracking-tight">Notas de Crédito</h2>
                    <p className="text-muted-foreground">
                        Supervisa notas de remisión, gestiona créditos y da seguimiento a cuentas por cobrar.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/admin/notes/clients">
                        <Button variant="outline" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Directorio de Clientes
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Total Notes */}
                <Card className="shadow-sm border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                            Total Notas Dadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {notesResp?.meta?.total || 0}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Most Overdue Clients */}
                <Card className="shadow-sm border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex gap-2">
                            <Users strokeWidth={3} className="w-4 h-4 text-red-500" />
                            Clientes Mayor Deuda
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingClients ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <div className="space-y-2 mt-2">
                                {overdueClientsResp && overdueClientsResp.length > 0 ? (
                                    overdueClientsResp.map((client: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="truncate w-32 font-medium">{client.name}</span>
                                            <span className="text-red-600 font-bold whitespace-nowrap">
                                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(client.totalOverdue)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-500">No hay clientes morosos</span>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Overdue Notes Preview */}
                <Card className="shadow-sm border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex gap-2">
                            <CalendarOff strokeWidth={3} className="w-4 h-4 text-orange-500" />
                            Notas Vencidas Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingOverdue ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <div className="space-y-2 mt-2">
                                {overdueNotesResp?.items && overdueNotesResp.items.length > 0 ? (
                                    overdueNotesResp.items.map((note) => (
                                        <div key={note.id} className="flex justify-between items-center text-sm">
                                            <span className="font-mono text-gray-500">#{note.folio}</span>
                                            <span className="text-orange-600 font-medium whitespace-nowrap">
                                                {new Date(note.dueDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-500">Sin notas vencidas</span>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>


            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 py-4 border-t">
                {/* Search Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium whitespace-nowrap">Buscar:</span>
                    <Input
                        placeholder="Folio.."
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
                            status: val === "all" ? undefined : val as NoteStatus,
                            page: 1
                        })}
                    >
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Todos los estatus" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="ON_TIME">A Tiempo</SelectItem>
                            <SelectItem value="PARTIALLY_PAID_ON_TIME">Abono (A Tiempo)</SelectItem>
                            <SelectItem value="PARTIALLY_PAID_OVERDUE">Abono (Vencido)</SelectItem>
                            <SelectItem value="OVERDUE">Vencido</SelectItem>
                            <SelectItem value="PAID">Pagado</SelectItem>
                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium whitespace-nowrap">Desde:</span>
                    <Input
                        type="date"
                        className="w-full md:w-[150px]"
                        value={(filters.dateFrom as string) || ''}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium whitespace-nowrap">Hasta:</span>
                    <Input
                        type="date"
                        className="w-full md:w-[150px]"
                        value={(filters.dateTo as string) || ''}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0 mt-4 md:mt-0 w-full md:w-auto">
                    {isRefetching && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                    )}
                    <Button onClick={() => setCreateDialogOpen(true)} className="w-full md:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Nota
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <DataTable columns={columns} data={notesResp?.items || []} />

            {/* Pagination Controls */}
            <CustomPagination
                meta={notesResp?.meta}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                isLoading={isRefetching || isLoading}
            />

            <CreateNoteDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </div>
    );
};
