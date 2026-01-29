import { ColumnDef } from '@tanstack/react-table';
import { ClientResponseDto } from '@/types/users';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface ColumnsProps {
    onViewDetail: (client: ClientResponseDto) => void;
    onStatusChange: (client: ClientResponseDto) => void;
}

export const getColumns = ({
    onViewDetail,
    onStatusChange,
}: ColumnsProps): ColumnDef<ClientResponseDto>[] => [
        {
            accessorKey: 'client',
            header: 'Cliente',
            cell: ({ row }) => {
                const client = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>
                                {client.fullName?.substring(0, 2).toUpperCase() || 'CL'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{client.fullName || 'Sin nombre'}</span>
                            <span className="text-sm text-muted-foreground">{client.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Teléfono',
            cell: ({ row }) => {
                return (row.original as any).phoneNumber || 'N/A';
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
                const client = row.original;
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
                            <DropdownMenuItem onClick={() => onViewDetail(client)}>
                                Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onStatusChange(client)}>
                                {client.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
