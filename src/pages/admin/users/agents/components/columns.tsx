import { ColumnDef } from '@tanstack/react-table';
import { AgentResponseDto } from '@/types/users';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Lock, Unlock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GetColumnsProps {
    onViewDetail: (agent: AgentResponseDto) => void;
    onStatusChange: (agent: AgentResponseDto) => void;
    onEdit: (agent: AgentResponseDto) => void;
}

export const getColumns = ({ onViewDetail, onStatusChange, onEdit }: GetColumnsProps): ColumnDef<AgentResponseDto>[] => [
    {
        accessorKey: 'fullName',
        header: 'Agente',
        cell: ({ row }) => {
            const agent = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${agent.fullName}&background=random`} alt={agent.fullName} />
                        <AvatarFallback>{agent.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{agent.fullName}</span>
                        <span className="text-sm text-gray-500">{agent.email}</span>
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
                <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const agent = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewDetail(agent)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(agent)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onStatusChange(agent)}>
                            {agent.status === 'ACTIVE' ? (
                                <>
                                    <Lock className="mr-2 h-4 w-4 text-red-500" />
                                    <span className="text-red-500">Desactivar</span>
                                </>
                            ) : (
                                <>
                                    <Unlock className="mr-2 h-4 w-4 text-green-500" />
                                    <span className="text-green-500">Activar</span>
                                </>
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
