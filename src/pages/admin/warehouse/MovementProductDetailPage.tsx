
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWarehouses } from '@/pages/admin/hooks/useAdminWarehouse';
import { DataTable } from "@/components/ui/data-table";
import { movementColumns } from './components/movements.columns';
import { Button } from '@/components/ui/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, PackageOpen, Calendar, User as UserIcon, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Movement } from '@/types/warehouse';
import { Badge } from '@/components/ui/badge';

export const MovementProductDetailPage = () => {
    const { warehouseId, productId } = useParams<{ warehouseId: string; productId: string }>();
    const navigate = useNavigate();
    const { useGetMovementsByProduct } = useWarehouses();
    const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

    const { data: movements, isLoading, isError } = useGetMovementsByProduct(warehouseId || '', productId || '');

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    if (isError || !movements) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
                <PackageOpen className="h-16 w-16 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900">No se pudo cargar el historial</h3>
                <p className="text-gray-500">Hubo un error al obtener los movimientos o no existen datos.</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
            </div>
        );
    }

    const productInfo = movements[0]?.product;
    const warehouseInfo = movements[0]?.warehouse;

    // Si no hay movimientos, tal vez deberíamos obtener info del producto de otra forma, 
    // pero por ahora mostraremos estado vacío con botón atrás.
    if (movements.length === 0) {
        return (
            <div className="p-8 space-y-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Almacén
                </Button>

                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <PackageOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Sin movimientos registrados</h3>
                    <p className="text-gray-500 max-w-sm mt-2">
                        Este producto no tiene historial de movimientos en este almacén todavía.
                    </p>
                </div>
            </div>
        );
    }

    const currentStock = movements[0]?.newStock; // El más reciente debería ser el primero si viene ordenado por fecha DESC

    // Configurar onRowClick para la tabla (si DataTable lo soporta, si no, envolvemos rows)
    // Asumiendo que DataTable de shadcn estándar no tiene prop directa de onRowClick a menos que se extienda,
    // pero podemos pasar el component y customizar.
    // Para simplificar y dado que el user pidió "cuando el Usuario de click en un movimiento", 
    // y estamos usando el componente genérico DataTable, voy a asumir que podemos modificar columns para incluir una acción
    // O envolver la tabla. 
    // Re-check: El usuario dijo "cuando el Usuario de click en un movimiento", idealmente row click.
    // Si DataTable no expone row click, modificar columns para tener un botón "Ver Detalle" es lo más seguro sin ver el código de DataTable. 
    // Pero voy a intentar usar row props si puedo. 
    // Como no puedo editar DataTable fácilmente sin ver su código (aunque lo tengo en steps anteriores, y es shadcn std),
    // Voy a agregar una columna de acciones a movementColumns localmente o extenderla aquí.

    // Mejor enfoque: La columna de acciones es explícita y clara.

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{productInfo?.name}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{productInfo?.sku}</span>
                            <span>•</span>
                            <span>Historial en <span className="font-medium text-gray-700">{warehouseInfo?.name}</span></span>
                        </div>
                    </div>
                </div>

                <Card className="shadow-sm border-none bg-blue-50/50 min-w-[200px]">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-blue-600/80">Stock Actual</CardDescription>
                        <CardTitle className="text-3xl font-bold text-blue-700">{currentStock}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-none shadow-md bg-white">
                <CardHeader>
                    <CardTitle>Movimientos (Kardex)</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={[
                            ...movementColumns,
                            {
                                id: "actions",
                                cell: ({ row }) => (
                                    <div className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedMovement(row.original)}
                                        >
                                            Ver Detalle
                                        </Button>
                                    </div>
                                )
                            }
                        ]}
                        data={movements}
                    />
                </CardContent>
            </Card>

            <Dialog open={!!selectedMovement} onOpenChange={(open) => !open && setSelectedMovement(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalle del Movimiento</DialogTitle>
                        <DialogDescription>
                            ID: {selectedMovement?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMovement && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Fecha
                                    </span>
                                    <p className="font-medium text-sm">
                                        {new Date(selectedMovement.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <UserIcon className="h-3 w-3" /> Realizado por
                                    </span>
                                    {/* <p className="font-medium text-sm">
                                        {selectedMovement.user.fullName}
                                    </p> */}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg space-y-2 border">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Tipo</span>
                                    <Badge variant="outline">{selectedMovement.type}</Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Cantidad</span>
                                    <span className="font-bold">{selectedMovement.quantity}</span>
                                </div>
                                <div className="border-t my-2 border-gray-200"></div>
                                <div className="flex justify-between items-center text-sm pt-1">
                                    <span className="text-gray-500">Stock Anterior</span>
                                    <span>{selectedMovement.previousStock}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Nuevo Stock</span>
                                    <span className="font-bold text-gray-900">{selectedMovement.newStock}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <FileText className="h-3 w-3" /> Referencia / Notas
                                </span>
                                <div className="text-sm bg-white border p-2 rounded min-h-[60px] text-gray-700">
                                    {selectedMovement.reference && (
                                        <div className="mb-2">
                                            <span className="font-semibold text-xs uppercase text-gray-400">Ref:</span> {selectedMovement.reference}
                                        </div>
                                    )}
                                    {selectedMovement.notes ? selectedMovement.notes : <span className="text-gray-400 italic">Sin notas adicionales</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setSelectedMovement(null)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
