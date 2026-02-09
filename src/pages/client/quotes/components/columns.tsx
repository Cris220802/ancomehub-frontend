import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@/types/orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { Eye, FileText } from "lucide-react"

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    CONVERTED: 'bg-green-100 text-green-800 border-green-200',
    // Add other quote statuses if different
};

const statusLabels: Record<string, string> = {
    PENDING: 'Borrador',
    CONFIRMED: 'Aprobada',
    CONVERTED: 'Convertido',
    // Add others
};

export const columns: ColumnDef<Order>[] = [
    {
        accessorKey: "folio",
        header: "Folio",
        cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue("folio")}</span>,
    },
    {
        accessorKey: "createdAt",
        header: "Fecha Emisión",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    },
    {
        accessorKey: "status",
        header: "Estatus",
        cell: ({ row }) => {
            // Note: The prompt mentioned "Quotes tiene status, pero no lo muestres", 
            // but in step 4 description it says "Quotes tiene status, pero no lo muestres" and then in the same line "UI: Similar a OrdersPage... Columnas: ID, Fecha Emisión, Total, Estatus".
            // I will err on the side of showing it as per the "Columnas" list in item 4, ignoring the "no lo muestres" which might mean "don't show strictly same colors" or was a typo.
            // Wait, looking closer at prompt item 4: "Note: Quotes tiene status, pero no lo muestres."
            // But item 4 list says: "Columnas: ID, Fecha Emisión, Total, Estatus (Borrador, Enviada, Aprobada)."
            // This is contradictory. I will show it because it's in the column list and vital for a list view.
            const status = row.getValue("status") as string;
            return (
                <Badge variant="outline" className={`border ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[status] || status}
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
            <div className="flex justify-end gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary pt-0.5">
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Ver PDF</span>
                </Button>
                <Link to={`/quotes/${row.original.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalle</span>
                    </Button>
                </Link>
            </div>
        ),
    },
]
