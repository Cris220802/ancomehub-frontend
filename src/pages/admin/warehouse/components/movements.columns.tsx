
import { ColumnDef } from "@tanstack/react-table";
import { Movement, MovementType } from "@/types/warehouse";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowRightLeft, RefreshCw, ShoppingCart, Truck } from "lucide-react";

const getMovementTypeConfig = (type: MovementType) => {
    switch (type) {
        case MovementType.IN_PURCHASE:
            return { label: 'Compra', color: 'bg-green-100 text-green-800', icon: ShoppingCart };
        case MovementType.IN_ADJUSTMENT:
            return { label: 'Ajuste (+)', color: 'bg-blue-100 text-blue-800', icon: RefreshCw };
        case MovementType.IN_TRANSFER:
            return { label: 'Transferencia (+)', color: 'bg-blue-100 text-blue-800', icon: Truck };
        case MovementType.OUT_SALE:
            return { label: 'Venta', color: 'bg-purple-100 text-purple-800', icon: ArrowUp }; // Using ArrowUp for output generally, or maybe specific icon
        case MovementType.OUT_ADJUSTMENT:
            return { label: 'Ajuste (-)', color: 'bg-orange-100 text-orange-800', icon: RefreshCw };
        case MovementType.OUT_TRANSFER:
            return { label: 'Transferencia (-)', color: 'bg-orange-100 text-orange-800', icon: Truck };
        default:
            return { label: type, color: 'bg-gray-100 text-gray-800', icon: ArrowRightLeft };
    }
};

export const movementColumns: ColumnDef<Movement>[] = [
    {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt);
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                        {date.toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => {
            const config = getMovementTypeConfig(row.original.type);
            const Icon = config.icon;

            return (
                <Badge variant="outline" className={cn("gap-1.5 font-normal", config.color)}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: "quantity",
        header: () => (
            <div className="text-right">Cantidad</div>
        ),
        cell: ({ row }) => {
            const isEntry = row.original.type.startsWith('IN_');
            return (
                <div className={cn("text-right font-bold", isEntry ? "text-green-600" : "text-red-600")}>
                    {isEntry ? '+' : '-'}{row.original.quantity}
                </div>
            );
        },
    },
    {
        accessorKey: "previousStock",
        header: () => (
            <div className="text-center text-xs text-gray-500">Stock Ant.</div>
        ),
        cell: ({ row }) => (
            <div className="text-center text-gray-500">
                {row.original.previousStock}
            </div>
        ),
    },
    {
        accessorKey: "newStock",
        header: () => (
            <div className="text-center font-bold">Stock Nuevo</div>
        ),
        cell: ({ row }) => (
            <div className="text-center font-bold text-gray-900 bg-gray-50 rounded px-2 py-1">
                {row.original.newStock}
            </div>
        ),
    },
    {
        accessorKey: "reference",
        header: "Referencia",
        cell: ({ row }) => (
            <span className="text-sm text-gray-600 truncate max-w-[150px] block" title={row.original.reference || ''}>
                {row.original.reference || '-'}
            </span>
        ),
    },
    // {
    //     accessorKey: "user.fullName",
    //     header: "Usuario",
    //     cell: ({ row }) => (
    //         <div className="flex items-center gap-2">
    //             <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
    //                 {row.original.user.fullName.charAt(0)}
    //             </div>
    //             <span className="text-sm text-gray-700">{row.original.user.fullName}</span>
    //         </div>
    //     ),
    // },
];
