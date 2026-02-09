
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminPriceLists } from '../hooks/useAdminPriceLists';
import { DataTable } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/common/CustomPagination';
import { PriceList } from '@/types/pricing';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreatePriceListDialog } from './components/CreatePriceListDialog';
import { Loader2, MoreHorizontal, Eye, Trash2, Search } from 'lucide-react';

export default function PriceListsPage() {
    const navigate = useNavigate();
    const { useGetPriceLists, useRemovePriceList } = useAdminPriceLists();
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading } = useGetPriceLists({
        page,
        limit: 10,
        name: debouncedSearch || undefined,
    });

    const removeMutation = useRemovePriceList();

    const handleDelete = () => {
        if (deleteId) {
            removeMutation.mutate(deleteId, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const columns: ColumnDef<PriceList>[] = [
        {
            accessorKey: 'name',
            header: 'Nombre',
            cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
        },
        {
            accessorKey: 'description',
            header: 'Descripción',
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm truncate max-w-[300px] block">
                    {row.getValue('description') || '-'}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const list = row.original;
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
                            <DropdownMenuItem onClick={() => navigate(`/admin/pricing/${list.id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeleteId(list.id)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Listas de Precios</h1>
                    <p className="text-muted-foreground">
                        Administra las reglas de precios y asignaciones a clientes.
                    </p>
                </div>
                <CreatePriceListDialog />
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar lista..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <DataTable columns={columns} data={data?.items || []} />
            </div>

            <CustomPagination
                meta={data?.meta}
                onPageChange={setPage}
                isLoading={isLoading}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la lista de precios
                            y todas sus reglas asociadas. Los clientes asignados volverán al precio base.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={removeMutation.isPending}
                        >
                            {removeMutation.isPending ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
