import { ColumnDef } from "@tanstack/react-table"
import { Order, OrderStatus, OrderPaymentStatus } from "@/types/orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { Eye } from "lucide-react"

const statusColors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PARTIALLY_DELIVERED: 'bg-orange-100 text-orange-800 border-orange-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<OrderStatus, string> = {
    PENDING: 'Esperando confirmación',
    CONFIRMED: 'Confirmado',
    PARTIALLY_DELIVERED: 'Entrega Parcial',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
};

const paymentStatusColors: Record<OrderPaymentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PARTIALLY_PAID: 'bg-blue-100 text-blue-800 border-blue-200',
    PAID: 'bg-green-100 text-green-800 border-green-200',
};

const paymentStatusLabels: Record<OrderPaymentStatus, string> = {
    PENDING: 'Pendiente',
    PARTIALLY_PAID: 'Pagado Parcialmente',
    PAID: 'Pagado',
};

export const columns: ColumnDef<Order>[] = [
    {
        accessorKey: "folio",
        header: "Folio",
        cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue("folio")}</span>,
    },
    {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    },
    {
        accessorKey: "status",
        header: "Estatus de Pedido",
        cell: ({ row }) => {
            const status = row.getValue("status") as OrderStatus;
            return (
                <Badge variant="outline" className={`border ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[status] || status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "paymentStatus",
        header: "Estatus de Pago",
        cell: ({ row }) => {
            const status = row.getValue("paymentStatus") as OrderPaymentStatus;
            return (
                <Badge variant="outline" className={`border ${paymentStatusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                    {paymentStatusLabels[status] || status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(row.getValue("totalAmount"))}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end">
                <Link to={`/orders/${row.original.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalle</span>
                    </Button>
                </Link>
            </div>
        ),
    },
]
