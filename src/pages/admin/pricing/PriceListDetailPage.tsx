
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminPriceLists } from '../hooks/useAdminPriceLists';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Loader2,
    Calendar,
    Tag,
    Users,
    Trash2,
    Edit2
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { PriceListItem } from '@/types/pricing';
import { getImageUrl, formatCurrency } from '@/lib/utils';
import { UpsertPriceListItemDialog } from './components/UpsertPriceListItemDialog';
import { AssignClientsDialog } from './components/AssignClientsDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function PriceListDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { useGetPriceListDetail, useRemovePriceListItem, useUnassignClient } = useAdminPriceLists();
    const { data: list, isLoading } = useGetPriceListDetail(id!);
    const removeMutation = useRemovePriceListItem();
    const unassignMutation = useUnassignClient();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!list) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Lista no encontrada</h2>
                <Link to="/admin/pricing">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                </Link>
            </div>
        );
    }

    // --- COLUMNS FOR ITEMS TAB ---
    const itemsColumns: ColumnDef<PriceListItem>[] = [
        {
            accessorKey: 'product',
            header: 'Producto',
            cell: ({ row }) => {
                const product = row.original.product;
                if (!product) return <span className="text-red-500">Producto Eliminado</span>;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded border overflow-hidden shrink-0">
                            <img
                                src={getImageUrl(product.imageUrl)}
                                alt=""
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'type',
            header: 'Tipo de Regla',
            cell: ({ row }) => {
                const isFixed = row.original.fixedPrice !== null && row.original.fixedPrice !== undefined;
                return (
                    <Badge variant={isFixed ? "default" : "secondary"}>
                        {isFixed ? "Precio Fijo" : "Descuento"}
                    </Badge>
                );
            },
        },
        {
            header: 'Valor',
            cell: ({ row }) => {
                const isFixed = row.original.fixedPrice !== null && row.original.fixedPrice !== undefined;
                return (
                    <span className="font-bold text-gray-900">
                        {isFixed
                            ? formatCurrency(row.original.fixedPrice!)
                            : `${row.original.discountPercent}%`
                        }
                    </span>
                );
            },
        },
        {
            header: 'Precio Final Aprox.',
            cell: ({ row }) => {
                const product = row.original.product;
                if (!product) return '-';

                let finalPrice = 0;
                if (row.original.fixedPrice) {
                    finalPrice = row.original.fixedPrice;
                } else if (row.original.discountPercent) {
                    finalPrice = product.basePrice * (1 - row.original.discountPercent / 100);
                }

                return (
                    <div className="text-sm">
                        <span className="text-gray-400 line-through text-xs mr-2">{formatCurrency(product.basePrice)}</span>
                        <span className="text-green-600 font-medium">{formatCurrency(finalPrice)}</span>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <UpsertPriceListItemDialog
                        listId={list.id}
                        existingItem={row.original}
                        trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        }
                    />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar regla?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    El producto volverá a su precio base para los clientes asignados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => removeMutation.mutate({ itemId: row.original.id, listId: list.id })}
                                >
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        }
    ];

    // --- COLUMNS FOR CLIENTS TAB ---
    // Assuming clientProfiles is populated in the detail response
    // If specific fields are separate, adjust map.
    const clientColumns: ColumnDef<any>[] = [
        // clientProfile in backend entity usually has user relation loaded? 
        // Based on Type: clientProfiles: ClientProfile[] which has user property.
        {
            accessorKey: 'user',
            header: 'Cliente',
            cell: ({ row }) => {
                const profile = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {profile.user?.fullName?.charAt(0) || 'C'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{profile.user?.fullName}</p>
                            <p className="text-xs text-muted-foreground">{profile.user?.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'companyName',
            header: 'Empresa',
        },
        {
            header: 'Acciones',
            cell: ({ row }) => (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600">
                            Desasignar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Desasignar cliente?</AlertDialogTitle>
                            <AlertDialogDescription>
                                El cliente dejará de ver los precios especiales de esta lista.{' '}
                                {row.original.user?.fullName && (
                                    <span className="font-medium text-gray-900 block mt-1">
                                        {row.original.user.fullName}
                                    </span>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => unassignMutation.mutate({ userId: row.original.user?.id })}
                            >
                                Desasignar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ),
        }
    ];

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Link to="/admin/pricing">
                        <Button variant="ghost" size="icon" className="mt-1">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {list.name}
                            <Badge variant="outline" className="font-normal text-sm">
                                {list.items.length} Reglas
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground mt-1 max-w-2xl">
                            {list.description || "Sin descripción"}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                            {/* <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Creada: {new Date(list.createdAt).toLocaleDateString()}
                            </span> */}
                            <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {list.clientProfiles?.length || 0} Clientes Asignados
                            </span>
                        </div>
                    </div>
                </div>
                {/* Actions placeholder (Edit Header) */}
                {/* <Button variant="outline">Editar Datos</Button> */}
            </div>

            <Tabs defaultValue="items" className="space-y-6">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                    <TabsTrigger value="items" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                        <Tag className="mr-2 h-4 w-4" /> Reglas de Precio
                    </TabsTrigger>
                    <TabsTrigger value="clients" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                        <Users className="mr-2 h-4 w-4" /> Clientes Asignados
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Productos con Precio Especial</h3>
                            <p className="text-sm text-gray-500">Gestiona los descuentos y precios fijos de esta lista.</p>
                        </div>
                        <UpsertPriceListItemDialog listId={list.id} />
                    </div>

                    <div className="rounded-md border bg-white">
                        <DataTable columns={itemsColumns} data={list.items || []} />
                    </div>
                </TabsContent>

                <TabsContent value="clients" className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Clientes Suscritos</h3>
                            <p className="text-sm text-gray-500">Estos clientes verán los precios definidos en esta lista.</p>
                        </div>
                        <AssignClientsDialog listId={list.id} />
                    </div>

                    <div className="rounded-md border bg-white">
                        <DataTable columns={clientColumns} data={list.clientProfiles || []} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
