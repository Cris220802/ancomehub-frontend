
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import { DataTable } from '@/components/ui/data-table';
import { Quote, QuoteStatus } from '@/types/orders';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Eye } from 'lucide-react';
import { CustomPagination } from '@/components/common/CustomPagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/Input';

interface ClientQuotesTableProps {
    clientId: string;
}

export function ClientQuotesTable({ clientId }: ClientQuotesTableProps) {
    const navigate = useNavigate();
    const { useGetClientQuotes } = useAdminOrders();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | undefined>(undefined);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [folioFilter, setFolioFilter] = useState<string>('');
    const [debouncedFolio, setDebouncedFolio] = useState<string>('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFolio(folioFilter);
            setPage(1); // Reset page on filter change
        }, 500);
        return () => clearTimeout(timer);
    }, [folioFilter]);

    // Reset page when other filters change
    useEffect(() => {
        setPage(1);
    }, [statusFilter, dateFrom, dateTo]);

    const { data, isLoading } = useGetClientQuotes(clientId, {
        page,
        limit,
        status: statusFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        folio: debouncedFolio || undefined
    });

    const columns: ColumnDef<Quote>[] = [
        {
            accessorKey: 'folio',
            header: 'Folio',
            cell: ({ row }) => <span className="font-medium text-blue-600">{row.getValue('folio')}</span>,
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
            accessorKey: 'validUntil',
            header: 'Válida Hasta',
            cell: ({ row }) => {
                const dateStr = row.getValue('validUntil') as string | null;
                if (!dateStr) return <span className="text-muted-foreground">-</span>;
                const date = new Date(dateStr);
                return date.toLocaleDateString();
            },
        },
        {
            accessorKey: 'status',
            header: 'Estado',
            cell: ({ row }) => {
                const status = row.getValue('status') as QuoteStatus;
                let variant: "default" | "secondary" | "outline" = "default";

                switch (status) {
                    case 'PENDING': variant = "secondary"; break;
                    case 'CONVERTED': variant = "default"; break;
                    default: variant = "outline";
                }

                return <Badge variant={variant}>{status === 'CONVERTED' ? 'Convertida' : 'Pendiente'}</Badge>;
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
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/orders/quotes/${row.original.id}`)}
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

    return (
        <div className="space-y-4">
            {/* Filters */}
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
                        onValueChange={(val) => setStatusFilter(val === "ALL" ? undefined : val as QuoteStatus)}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas</SelectItem>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="CONVERTED">Convertida</SelectItem>
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

            {/* Table */}
            <div className="rounded-md border">
                <DataTable columns={columns} data={data?.items || []} />
            </div>

            {/* Pagination Component */}
            <CustomPagination
                meta={data?.meta}
                onPageChange={setPage}
                isLoading={isLoading}
            />
        </div>
    );
}
