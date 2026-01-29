import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdminAgents } from '../../hooks/useAdminAgents';
import { ClientsFilterDto, ClientResponseDto } from '@/types/users';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Search, Loader2 } from 'lucide-react';
import {
    ColumnDef
} from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface AgentClientsListProps {
    agentId: string;
}

export function AgentClientsList({ agentId }: AgentClientsListProps) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<ClientsFilterDto>({ limit: 5, page: 1 });
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useDebounce(searchTerm, 500);
    const { useGetAgentClients } = useAdminAgents();

    useEffect(() => {
        setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
    }, [debouncedSearch]);

    const { data: clientsData, isLoading, isRefetching } = useGetAgentClients(agentId, filters);

    const columns: ColumnDef<ClientResponseDto>[] = useMemo(() => [
        {
            accessorKey: 'fullName',
            header: 'Cliente',
            cell: ({ row }) => {
                const client = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${client.fullName}&background=random`} />
                            <AvatarFallback>{client.fullName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">{client.fullName || 'Sin nombre'}</span>
                            <span className="text-xs text-muted-foreground">{client.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Estatus',
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant={status === 'ACTIVE' ? 'default' : status === 'INACTIVE' ? 'secondary' : 'outline'}>
                        {status === 'ACTIVE' ? 'Activo' : (status === 'INACTIVE' ? 'Inactivo' : 'Pendiente')}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/clients/${row.original.id}`)}
                    >
                        Ver Detalle
                    </Button>
                )
            }
        }
    ], [navigate]);

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cliente asignado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-9"
                    />
                </div>
                {isRefetching && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
        </div>
    );
}
