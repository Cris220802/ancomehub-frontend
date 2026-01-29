
import { ColumnDef } from "@tanstack/react-table";
import { Order, OrderStatus, OrderPaymentStatus } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

// Status helpers (reused from OrderDetailPage logic roughly, or centralize later)
const statusColors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PARTIALLY_DELIVERED: 'bg-indigo-100 text-indigo-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<OrderPaymentStatus, string> = {
    PENDING: 'bg-red-50 text-red-700 border-red-200',
    PARTIALLY_PAID: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    PAID: 'bg-green-50 text-green-700 border-green-200',
};

const statusLabels: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PARTIALLY_DELIVERED: 'Parcialmente Entregado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
};

const paymentStatusLabels: Record<OrderPaymentStatus, string> = {
    PENDING: 'Pendiente',
    PARTIALLY_PAID: 'Pago Parcial',
    PAID: 'Pagado',
};

export const columns: ColumnDef<Order>[] = [
    {
        accessorKey: "folio",
        header: "Folio",
    },
    {
        accessorKey: "user.fullName",
        header: "Cliente",
        cell: ({ row }) => {
            const user = row.original.user;
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{user?.fullName || 'N/A'}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
            );
        }
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fecha
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return new Date(row.getValue("createdAt")).toLocaleDateString("es-MX");
        },
    },
    {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"));
            return <div className="text-right font-medium">
                {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                }).format(amount)}
            </div>
        },
    },
    {
        accessorKey: "status",
        header: "Estado del Pedido",
        cell: ({ row }) => {
            const status = row.getValue("status") as OrderStatus;
            return (
                <Badge variant="outline" className={statusColors[status]}>
                    {statusLabels[status]}
                </Badge>
            );
        },
    },
    {
        accessorKey: "paymentStatus",
        header: "Estado de Pago",
        cell: ({ row }) => {
            const status = row.getValue("paymentStatus") as OrderPaymentStatus;
            const balance = row.original.balance;

            return (
                <div className="flex flex-col gap-1">
                    <Badge variant="outline" className={paymentStatusColors[status]}>
                        {paymentStatusLabels[status]}
                    </Badge>
                    {balance > 0 && (
                        <span className="text-[10px] text-red-500 font-medium">
                            Restan: {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(balance)}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border border-gray-200 p-4" align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="cursor-pointer mt-2">
                            <Link to={`/admin/orders/${order.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> Ver Detalle
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
