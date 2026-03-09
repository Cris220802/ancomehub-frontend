import { ColumnDef } from "@tanstack/react-table";
import { AccountStatementItem } from "@/types/note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { ArrowUpDown, Eye, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ON_TIME: 'bg-blue-100 text-blue-800 border-blue-200',
    PARTIALLY_PAID_ON_TIME: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    PARTIALLY_PAID_OVERDUE: 'bg-orange-100 text-orange-800 border-orange-200',
    OVERDUE: 'bg-red-100 text-red-800 border-red-200',
    PAID: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    ON_TIME: 'A Tiempo',
    PARTIALLY_PAID_ON_TIME: 'Abono (A Tiempo)',
    PARTIALLY_PAID_OVERDUE: 'Abono (Vencido)',
    OVERDUE: 'Vencido',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
};

export const statementColumns: ColumnDef<AccountStatementItem>[] = [
    {
        accessorKey: "folio",
        header: "Folio",
        cell: ({ row }) => <span className="font-medium text-gray-900"># {row.getValue("folio")}</span>
    },
    {
        accessorKey: "dueDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fecha Vencimiento
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return new Date(row.getValue("dueDate")).toLocaleDateString("es-MX");
        },
    },
    {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">Monto Total</div>,
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
        accessorKey: "paidAmount",
        header: () => <div className="text-right">Abonado</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("paidAmount"));
            return <div className="text-right font-medium text-green-600">
                {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                }).format(amount)}
            </div>
        },
    },
    {
        accessorKey: "pendingAmount",
        header: () => <div className="text-right font-bold">Saldo Pendiente</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("pendingAmount"));
            return <div className="text-right font-bold text-red-600">
                {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                }).format(amount)}
            </div>
        },
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant="outline" className={statusColors[status] || 'bg-gray-100'}>
                    {statusLabels[status] || status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const note = row.original;
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
                            <Link to={`/admin/notes/${note.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles de la Nota
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
