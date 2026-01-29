
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import { DataTable } from '@/components/ui/data-table';
import { Order, OrderStatus, PaymentMethod } from '@/types/orders';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Eye } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/Input';

interface ClientOrdersTableProps {
    clientId: string;
}

export function ClientOrdersTable({ clientId }: ClientOrdersTableProps) {
    const navigate = useNavigate();
    const { useGetClientOrders } = useAdminOrders();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | undefined>(undefined);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [folioFilter, setFolioFilter] = useState<string>('');
    const [debouncedFolio, setDebouncedFolio] = useState<string>('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFolio(folioFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [folioFilter]);

    const { data, isLoading } = useGetClientOrders(clientId, {
        page,
        limit,
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        folio: debouncedFolio || undefined
    });

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'folio',
            header: 'Folio',
            cell: ({ row }) => <span className="font-medium">{row.getValue('folio')}</span>,
        },
        {
            accessorKey: 'createdAt',
            header: 'Fecha',
            cell: ({ row }) => {
                const date = new Date(row.getValue('createdAt'));
                return date.toLocaleDateString();
            },
        },
        {
            accessorKey: 'status',
            header: 'Estado',
            cell: ({ row }) => {
                const status = row.getValue('status') as OrderStatus;
                let variant: "default" | "secondary" | "destructive" | "outline" = "default";

                switch (status) {
                    case 'PENDING': variant = "secondary"; break;
                    case 'CONFIRMED': variant = "default"; break;
                    case 'COMPLETED': variant = "default"; break;
                    case 'CANCELLED': variant = "destructive"; break;
                    default: variant = "outline";
                }

                return <Badge variant={variant}>{status}</Badge>;
            },
        },
        {
            accessorKey: 'totalAmount',
            header: 'Total',
            cell: ({ row }) => (
                <span className="font-semibold text-green-700">
                    {formatCurrency(row.getValue('totalAmount'))}
                </span>
            ),
        },
        {
            accessorKey: 'paymentStatus',
            header: 'Pago',
            cell: ({ row }) => {
                const status = row.getValue('paymentStatus') as string;
                return (
                    <Badge variant="outline" className={
                        status === 'PAID' ? 'text-green-600 border-green-200 bg-green-50' :
                            status === 'PARTIALLY_PAID' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                'text-gray-600'
                    }>
                        {status === 'PAID' ? 'Pagado' : status === 'PARTIALLY_PAID' ? 'Parcial' : 'Pendiente'}
                    </Badge>
                );
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/orders/${row.original.id}`)}
                    >
                        <Eye className="h-4 w-4 mr-1" /> Ver
                    </Button>
                );
            },
        },
    ];

    if (isLoading) {
        return <div className="py-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
    }

    const totalPages = data?.meta.lastPage || 1;

    return (
        <div className="space-y-4">
            <div className="flex flex-col xl:flex-row gap-2 w-full">
                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto flex-1">
                    <Input
                        placeholder="Buscar por folio..."
                        value={folioFilter}
                        onChange={(e) => setFolioFilter(e.target.value)}
                        className="w-full sm:w-[200px]"
                    />
                    <Select
                        value={statusFilter || "ALL"}
                        onValueChange={(val) => setStatusFilter(val === "ALL" ? undefined : val as OrderStatus)}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los estados</SelectItem>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                            <SelectItem value="PARTIALLY_DELIVERED">Parcialmente Entregado</SelectItem>
                            <SelectItem value="COMPLETED">Completado</SelectItem>
                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={paymentMethodFilter || "ALL"}
                        onValueChange={(val) => setPaymentMethodFilter(val === "ALL" ? undefined : val as PaymentMethod)}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Método de Pago" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los métodos</SelectItem>
                            <SelectItem value="CASH">Efectivo</SelectItem>
                            <SelectItem value="TRANSFER">Transferencia</SelectItem>
                            <SelectItem value="CREDIT">Crédito</SelectItem>
                            <SelectItem value="CHECK">Cheque</SelectItem>
                            <SelectItem value="DEPOSIT">Depósito</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto">
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full sm:w-[150px]"
                        placeholder="Desde"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full sm:w-[150px]"
                        placeholder="Hasta"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <DataTable columns={columns} data={data?.items || []} />
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationLink isActive>{page}</PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
