import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, FileEdit, Trash2, Power, PowerOff } from "lucide-react"

import { Button } from "@/components/ui/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Product, ProductAdmin } from "../../../types/products"
import { getImageUrl } from "@/lib/utils"

// Format currency helper
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(value);
};

interface ColumnsProps {
    onEdit: (product: ProductAdmin) => void;
    onDelete: (product: ProductAdmin) => void;
    onToggleStatus: (product: ProductAdmin) => void;
}

export const getColumns = ({ onEdit, onDelete, onToggleStatus }: ColumnsProps): ColumnDef<ProductAdmin>[] => [
    {
        accessorKey: "imageUrl",
        header: "Imagen",
        cell: ({ row }) => {
            const imageUrl = getImageUrl(row.getValue("imageUrl"));
            const name = row.getValue("name") as string;
            return (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={imageUrl} alt={name} />
                    <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            );
        }
    },
    {
        accessorKey: "name",
        header: "Producto",
    },
    {
        accessorKey: "category",
        header: "Categoría",
        cell: ({ row }) => {
            const category = row.original.category;
            return category?.name || <span className="text-gray-400">Sin categoría</span>;
        }
    },
    {
        accessorKey: "basePrice",
        header: "Precio",
        cell: ({ row }) => formatCurrency(row.getValue("basePrice")),
    },
    {
        accessorKey: "stock",
        header: "Stock",
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive") as boolean;
            return (
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600 hover:bg-green-700 text-white" : ""}>
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original
            const isActive = product.isActive;

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
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                            {isActive ? <PowerOff className="mr-2 h-4 w-4 text-orange-500" /> : <Power className="mr-2 h-4 w-4 text-green-500" />}
                            {isActive ? 'Desactivar' : 'Activar'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
