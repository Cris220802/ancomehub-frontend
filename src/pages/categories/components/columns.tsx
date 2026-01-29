import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, FileEdit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Category } from "../../../types/categories"

// Define props/context for actions
interface ColumnsProps {
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

// Function helper to generate columns with access to handlers
export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Category>[] => [
    {
        accessorKey: "name",
        header: "Nombre",
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => {
            const description = row.getValue("description") as string;
            return description || <span className="text-gray-400 italic">Sin descripción</span>;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const category = row.original

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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(category.id)}
                        >
                            Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(category)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
