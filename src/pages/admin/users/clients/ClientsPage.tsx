import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdminClients } from '../../hooks/useAdminClients';
import {
    ClientResponseDto,
    UserStatus,
    ClientsFilterDto
} from '@/types/users';
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Plus, Search, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { InviteClientDialog } from './InviteClientDialog';
import { useNavigate } from 'react-router-dom';
import { getColumns } from './components/columns';

export default function ClientsPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<ClientsFilterDto>({ limit: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
    const [inviteOpen, setInviteOpen] = useState(false);
    const [creditOpen, setCreditOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientResponseDto | null>(null);

    const { useGetClients, useUpdateClientStatus } = useAdminClients();

    const debouncedSearch = useDebounce(searchTerm, 500);
    const debouncedFullName = useDebounce(fullName, 500);
    const debouncedCompanyName = useDebounce(companyName, 500);
    const debouncedTaxId = useDebounce(taxId, 500);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            search: debouncedSearch,
            fullName: debouncedFullName,
            companyName: debouncedCompanyName,
            taxId: debouncedTaxId,
            page: 1
        }));
    }, [debouncedSearch, debouncedFullName, debouncedCompanyName, debouncedTaxId]);

    const { data: clientsData, isLoading, isError, refetch, isRefetching } = useGetClients(filters);
    const updateStatusMutation = useUpdateClientStatus();

    const handleStatusChange = (client: ClientResponseDto) => {
        const newAction = client.status === 'ACTIVE' ? 'desactivate' : 'activate';
        updateStatusMutation.mutate({ id: client.id, action: newAction });
    };

    const handleManageCredit = (client: ClientResponseDto) => {
        setSelectedClient(client);
        setCreditOpen(true);
    };

    const handleViewDetail = (client: ClientResponseDto) => {
        navigate(`/admin/clients/${client.id}`);
    };

    const columns = useMemo(() => getColumns({
        onViewDetail: handleViewDetail,
        onStatusChange: handleStatusChange
    }), []);

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-96">
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
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cartera de Clientes</h2>
                    <p className="text-muted-foreground">
                        Gestiona los clientes, sus créditos y estatus.
                    </p>
                </div>
                <Button onClick={() => setInviteOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invitar Cliente
                </Button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder="Nombre..."
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder="Razón Social..."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                </div>
                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder="RFC..."
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value as UserStatus | 'ALL');
                        setFilters(prev => ({
                            ...prev,
                            // If ALL, we send undefined or don't send status
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
                data={clientsData?.items || []}
            />

            <CustomPagination
                meta={clientsData?.meta}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                isLoading={isRefetching || isLoading}
            />

            <InviteClientDialog open={inviteOpen} onOpenChange={setInviteOpen} />

        </div>
    );
}

