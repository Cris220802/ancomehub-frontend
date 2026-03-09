import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { WeakClientResponseDto } from "@/types/note";
import { Button } from "@/components/ui/Button";
import { ArrowUpDown, Eye, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminWeakClient } from "@/pages/admin/hooks/useAdminWeakClient";
import { EditWeakClientDialog } from "./EditWeakClientDialog";

export const columns: ColumnDef<WeakClientResponseDto>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nombre / Razón Social
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue("name")}</span>
    },
    {
        accessorKey: "email",
        header: "Correo Electrónico",
        cell: ({ row }) => {
            const email = row.getValue("email") as string;
            return <span className="text-gray-600">{email || 'N/A'}</span>;
        }
    },
    {
        accessorKey: "phone",
        header: "Teléfono",
        cell: ({ row }) => {
            const phone = row.getValue("phone") as string;
            return <span className="text-gray-600">{phone || 'N/A'}</span>;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ClientActionsCell client={row.original} />,
    },
];

// Helper component for managing the dialogs and actions state inside the table cell
const ClientActionsCell = ({ client }: { client: WeakClientResponseDto }) => {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    // Import the hook to handle mutations and notifications
    const { useUpdateWeakClient, useDeleteWeakClient } = useAdminWeakClient();

    const updateMutation = useUpdateWeakClient();
    const deleteMutation = useDeleteWeakClient();

    const handleEditClient = (id: string, payload: any) => {
        updateMutation.mutate({ id, data: payload }, {
            onSuccess: () => {
                setEditOpen(false);
            }
        });
    };

    const handleDeleteClient = () => {
        deleteMutation.mutate(client.id, {
            onSuccess: () => {
                setDeleteOpen(false);
            }
        });
    };

    return (
        <>
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
                        <Link to={`/admin/notes/clients/${client.id}`} className="flex items-center cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Ver Estado de Cuenta
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer flex items-center"
                        onClick={() => setEditOpen(true)}
                    >
                        <Edit className="mr-2 h-4 w-4 text-blue-600" /> Editar Cliente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cliente
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditWeakClientDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                client={client}
                isPending={updateMutation.isPending}
                onSubmit={handleEditClient}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará al cliente "{client.name}" permanentemente.
                            Asegúrate de que no tenga notas de crédito asociadas para poder realizar esta acción.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteClient}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Sí, Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
