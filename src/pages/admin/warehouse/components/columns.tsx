import { ColumnDef } from "@tanstack/react-table";
import { WarehouseStock } from "@/types/warehouse";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, History } from "lucide-react";
import { getImageUrl, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

// Helper for stock status (se queda igual)
const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: 'Agotado', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
    if (quantity < 10) return { label: 'Bajo Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle };
    return { label: 'Disponible', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 };
};

// Componente ActionCell (se queda igual o lo mueves aquí)
const ActionCell = ({ warehouseId, productId }: { warehouseId: string, productId: string }) => {
    const navigate = useNavigate();
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/warehouses/${warehouseId}/products/${productId}`)}
            title="Ver Historial"
        >
            <History className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Ver Historial</span>
        </Button>
    );
};

// --- EL CAMBIO PRINCIPAL AQUÍ ---
// Convertimos la constante en una función que recibe el ID
export const getColumns = (warehouseId: string): ColumnDef<WarehouseStock>[] => [
    {
        accessorKey: "product.imageUrl",
        header: "Imagen",
        cell: ({ row }) => {
            const imageUrl = row.original.product.imageUrl;
            const name = row.original.product.name;
            return (
                <div className="h-10 w-10 index-0 rounded border bg-gray-50 p-1">
                    <img
                        src={getImageUrl(imageUrl)}
                        alt={name}
                        className="h-full w-full object-contain"
                    />
                </div>
            );
        },
    },
    {
        accessorKey: "product.name",
        header: "Producto",
        cell: ({ row }) => <span className="font-medium">{row.original.product.name}</span>,
    },
    {
        accessorKey: "product.sku",
        header: "SKU",
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.product.sku}</span>,
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => (
            <div className="text-center">Stock Físico</div>
        ),
        cell: ({ row }) => (
            <div className="text-center font-bold text-gray-700">
                {row.getValue("quantity")}
            </div>
        ),
    },
    {
        id: "status",
        header: ({ column }) => (
            <div className="text-right">Estado</div>
        ),
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            const status = getStockStatus(quantity);
            const StatusIcon = status.icon;

            return (
                <div className="flex justify-end">
                    <Badge variant="outline" className={cn("gap-1.5 font-normal", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <div className="flex justify-end">
                    {/* AQUI YA PUEDES USAR EL warehouseId QUE RECIBE LA FUNCIÓN */}
                    <ActionCell
                        warehouseId={warehouseId}
                        productId={row.original.product.id}
                    />
                </div>
            )
        }
    }
];