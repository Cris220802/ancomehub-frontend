import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdminAgents } from '../../hooks/useAdminAgents';
import { AgentResponseDto, UserStatus, AgentsFilterDto } from '@/types/users';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Plus, Search, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { AgentFormDialog } from './AgentFormDialog';
import { useNavigate } from 'react-router-dom';
import { getColumns } from './components/columns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AgentsPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<AgentsFilterDto>({ limit: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
    const [formOpen, setFormOpen] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

    const { useGetAgents, useToggleAgentStatus } = useAdminAgents();

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        // Generic search that might map to fullName or email in backend if supported, 
        // or passing specific fields if I broke down the search. 
        // Using 'fullName' as primary search or if backend has a generic 'search' param in AgentsFilterDto (it doesn't seem to have generic 'search' in the shown type, but let's check).
        // Checked AgentsFilterDto in step 180: it has fullName, email, status. No generic 'search'.
        // I will map search input to fullName for now, or I'll add 'search' to DTO if I could, but sticking to provided types:
        // Actually, if I want to search by email OR name, I should probably ask backend to support 'search'.
        // BUT, given I can't easily change backend, I'll map it to fullName.
        setFilters(prev => ({ ...prev, fullName: debouncedSearch, page: 1 }));
    }, [debouncedSearch]);

    const { data: agentsData, isLoading, isError, refetch, isRefetching } = useGetAgents(filters);
    const toggleStatusMutation = useToggleAgentStatus();

    const handleStatusChange = (agent: AgentResponseDto) => {
        const newAction = agent.status === 'ACTIVE' ? 'desactivate' : 'activate';
        toggleStatusMutation.mutate({ id: agent.id, action: newAction });
    };

    const handleViewDetail = (agent: AgentResponseDto) => {
        navigate(`/admin/agents/${agent.id}`);
    };

    const handleEdit = (agent: AgentResponseDto) => {
        setSelectedAgentId(agent.id);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedAgentId(null);
        setFormOpen(true);
    };

    const columns = useMemo(() => getColumns({
        onViewDetail: handleViewDetail,
        onStatusChange: handleStatusChange,
        onEdit: handleEdit
    }), []);

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-96">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="font-semibold text-lg">Error al cargar agentes</h3>
                <p className="text-muted-foreground mb-4">No pudimos obtener la lista de agentes. Intenta nuevamente.</p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agentes de Ventas</h2>
                    <p className="text-muted-foreground">
                        Gestiona el equipo de ventas y sus asignaciones.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Agente
                </Button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value as UserStatus | 'ALL');
                        setFilters(prev => ({
                            ...prev,
                            status: value === 'ALL' ? undefined : (value as UserStatus),
                            page: 1
                        }));
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Estatus" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                    </SelectContent>
                </Select>
                {isRefetching && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
                )}
            </div>

            <DataTable
                columns={columns}
                data={agentsData?.items || []}
            />

            <CustomPagination
                meta={agentsData?.meta}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                isLoading={isRefetching || isLoading}
            />

            <AgentFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setSelectedAgentId(null);
                }}
                agentId={selectedAgentId}
            />
        </div>
    );
}
