import { ColumnDef } from '@tanstack/react-table';
import { FiscalDocument, FiscalStatus } from '@/types/fiscal';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/Button';

const statusConfig: Record<FiscalStatus, { label: string; color: string }> = {
    PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    PARTIALLY_PAID: { label: 'Parcial', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    PAID: { label: 'Pagado', color: 'bg-green-100 text-green-800 border-green-200' },
    CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' },
};

export const columns: ColumnDef<FiscalDocument>[] = [
    {
        accessorKey: 'fiscalUuid',
        header: 'Folio ',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-mono text-xs text-gray-500" title={row.original.fiscalUuid}>
                    {row.original.fiscalUuid}
                </span>
                {row.original.folio && <span className="text-xs font-bold text-gray-700">{row.original.folio}</span>}
            </div>
        ),
    },
    // {
    //     accessorKey: 'type',
    //     header: 'Tipo',
    //     cell: ({ row }) => {
    //         console.log(row.original);
    //         const typeMap: Record<string, string> = {
    //             INVOICE: 'Factura',
    //             PAYMENT_REP: 'REP',
    //             CREDIT_NOTE: 'Nota Crédito'
    //         };
    //         return <Badge variant="secondary" className="font-normal text-xs">{typeMap[row.original.type] || row.original.type}</Badge>;
    //     },
    // },
    {
        id: 'order',
        header: 'Orden Asociada',
        cell: ({ row }) => {
            const order = row.original.order;
            if (order) {
                return (
                    <Link to={`/admin/orders/${order.id}`} className="text-sm font-medium text-primary hover:underline">
                        {order.folio}
                    </Link>
                );
            }
            return <Badge variant="outline" className="text-xs font-normal">Factura Externa</Badge>;
        }
    },
    {
        id: 'client',
        header: 'Cliente',
        cell: ({ row }) => {
            const clientName = row.original.order?.user?.fullName || 'Cliente Externo';
            return <span className="text-sm font-medium text-gray-900">{clientName}</span>;
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Fecha Emisión',
        cell: ({ row }) => <span className="text-sm text-gray-600">{new Date(row.original.createdAt).toLocaleDateString('es-MX')}</span>,
    },
    {
        accessorKey: 'amount',
        header: () => <div className="text-right">Monto</div>,
        cell: ({ row }) => (
            <div className="text-right font-medium text-gray-900">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(row.original.amount)}
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Estatus',
        cell: ({ row }) => {
            const config = statusConfig[row.original.status] || { label: row.original.status, color: 'bg-gray-100' };
            return (
                <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", config.color)}>
                    {config.label}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <div className="flex justify-end">
                <Link
                    to={`/admin/fiscal/${row.original.id}`}
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-8 w-8 text-gray-500 hover:text-primary"
                    )}
                >
                    <Eye className="h-4 w-4" />
                </Link>
            </div>
        ),
    },
];
