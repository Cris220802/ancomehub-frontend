
import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdminOrders } from "@/pages/admin/hooks/useAdminOrders";
import { OrderStatus, RegisterShipmentDto } from "@/types/orders";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Loader2,
    ArrowLeft,
    Trash2,
    MapPin,
    Package,
    User,
    Mail,
    CreditCard,
    AlertCircle,
    Copy,
    CheckCircle2,
    Box,
    Clock,
    AlertTriangle,
    PackageCheck,
    Truck,
    FileText,
    Eye
} from "lucide-react";
import { PaymentReviewCard } from "./components/PaymentReviewCard";
import { getImageUrl, cn } from "@/lib/utils";
import { InternalInvoiceDialog } from "../fiscal/components/InternalInvoiceDialog";
import { ShipmentDialog } from "./components/ShipmentDialog";

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
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon?: React.ReactNode }> = {
    PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    CONVERTED: { label: 'Convertido', color: 'bg-green-100 text-green-800 border-green-200' },
    PARTIALLY_DELIVERED: { label: 'Parcial', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' },
    COMPLETED: { label: 'Completado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const {
        useOrderDetail,
        useOrderPayments,
        useCancelOrder,
        useReviewPayment,
        useConfirmOrder,
        useRegisterShipment,
        useFulfillBackorders
    } = useAdminOrders();
    const [internalInvoiceOpen, setInternalInvoiceOpen] = useState(false);
    const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Queries
    const { data: order, isLoading: loadingOrder } = useOrderDetail(id || '');
    const { data: paymentsData, isLoading: loadingPayments } = useOrderPayments(id || '');

    // Mutations
    const cancelOrderMutation = useCancelOrder();
    const reviewPaymentMutation = useReviewPayment();
    const confirmOrderMutation = useConfirmOrder();
    const registerShipmentMutation = useRegisterShipment();
    const fulfillBackordersMutation = useFulfillBackorders();

    if (loadingOrder || loadingPayments) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Pedido no encontrado</h2>
                <Link to="/admin/orders">
                    <Button variant="link">Volver al listado</Button>
                </Link>
            </div>
        );
    }

    const currentStatus = statusConfig[order.status] || statusConfig.PENDING;
    const payments = paymentsData?.payments || [];

    // Calcular alertas y estados
    const pendingReviewCount = payments.filter((p: any) => p.status === 'PENDING_REVIEW').length;
    const hasBackorders = order.items.some((item: any) => (item.quantityPending || 0) > 0);
    const hasAllocated = order.items.some((item: any) => (item.quantityAllocated || 0) > 0);

    // Un pedido es "entregable" si está confirmado o parcial Y tiene ítems apartados
    const isDeliverable = (order.status === 'CONFIRMED' || order.status === 'PARTIALLY_DELIVERED') && hasAllocated;

    // Parse shippingInfo safely
    const shippingInfo = useMemo(() => {
        if (!order?.shippingInfo) return null;
        if (typeof order.shippingInfo === 'string') {
            try {
                return JSON.parse(order.shippingInfo);
            } catch (e) {
                console.error("Error parsing shippingInfo:", e);
                return null;
            }
        }
        return order.shippingInfo;
    }, [order?.shippingInfo]);

    const handleCancelOrder = () => {
        if (!id) return;
        cancelOrderMutation.mutate({ id, reason: cancelReason });
    };

    const handleConfirmOrder = () => {
        if (!id) return;
        confirmOrderMutation.mutate(id);
    };

    const handleRegisterShipment = (data: RegisterShipmentDto) => {
        if (!id) return;
        registerShipmentMutation.mutate({ id, data }, {
            onSuccess: () => setShipmentDialogOpen(false)
        });
    };

    const handleFulfillBackorders = () => {
        if (!id) return;
        // Solo para feedback visual inmediato, el hook ya hace el toast e invalidation
        fulfillBackordersMutation.mutate(id);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado al portapapeles");
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Top Bar Navigation */}
            <div className="bg-white border-b px-6 py-4 sticky top-0 z-10 w-full">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/orders">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-gray-900">Pedido {order.folio}</h1>
                                <Badge variant="outline" className={cn("text-xs font-medium", currentStatus.color)}>
                                    {currentStatus.label}
                                </Badge>
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                {order.id}
                                <Copy
                                    className="h-3 w-3 cursor-pointer hover:text-gray-900"
                                    onClick={() => copyToClipboard(order.id)}
                                />
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        {/* ACCIONES DE NEGOCIO */}

                        {/* 1. Confirmar Pedido (Solo PENDING) */}
                        {order.status === 'PENDING' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="bg-primary hover:bg-yellow-500 text-black border-none" disabled={confirmOrderMutation.isPending}>
                                        {confirmOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <PackageCheck className="mr-2 h-4 w-4" />
                                        Confirmar Pedido
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Confirmar Pedido?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esto reservará el stock disponible para este pedido y cambiará su estatus a <b>Confirmado</b>.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleConfirmOrder}>Confirmar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {/* 2. Registrar Envío (Solo si hay Allocated) */}
                        {isDeliverable && (
                            <Button
                                variant="outline"
                                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                onClick={() => setShipmentDialogOpen(true)}
                            >
                                <Truck className="mr-2 h-4 w-4" />
                                Registrar Envío
                            </Button>
                        )}

                        {/* 3. Surtir Backorders (Si hay pendientes) */}
                        {hasBackorders && (
                            <Button
                                variant="outline"
                                className="border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                onClick={handleFulfillBackorders}
                                disabled={fulfillBackordersMutation.isPending}
                            >
                                {fulfillBackordersMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                                Surtir Backorders
                            </Button>
                        )}

                        {/* DIVIDER */}
                        <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

                        {/* Selector de Estatus (Manual Override) */}
                        {/* <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
                            <span className="text-xs font-medium text-gray-500 pl-2">Status:</span>
                            <Select
                                value={order.status}
                                onValueChange={(val) => handleStatusChange(val as OrderStatus)}
                                disabled={updateStatusMutation.isPending || order.status === 'CANCELLED'}
                            >
                                <SelectTrigger className="w-[130px] h-8 border-0 bg-white shadow-sm text-xs">
                                    <SelectValue placeholder="Estatus" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pendiente</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                                    <SelectItem value="PARTIALLY_DELIVERED">Parcial</SelectItem>
                                    <SelectItem value="SHIPPED">Enviado</SelectItem>
                                    <SelectItem value="DELIVERED">Entregado</SelectItem>
                                    <SelectItem value="COMPLETED">Completado</SelectItem>
                                    <SelectItem value="CANCELLED" disabled>Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}

                        {/* Botón Subir Factura */}
                        {order.requiresInvoice && (!order.fiscalDocuments || order.fiscalDocuments.length === 0) && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100"
                                onClick={() => setInternalInvoiceOpen(true)}
                            >
                                <Copy className="h-4 w-4 mr-2" /> Factura
                            </Button>
                        )}

                        {/* Botón Cancelar */}
                        {order.status !== 'CANCELLED' && order.status !== 'PARTIALLY_DELIVERED' && order.status !== 'COMPLETED' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            ¿Estás seguro de cancelar el pedido <b>{order.folio}</b>?
                                            Esta acción es irreversible y liberará el stock apartado.
                                            <div className="mt-4">
                                                <Input
                                                    placeholder="Motivo de cancelación"
                                                    value={cancelReason}
                                                    onChange={(e) => setCancelReason(e.target.value)}
                                                />
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Volver</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancelOrder} className="bg-red-600 hover:bg-red-700">
                                            Sí, Cancelar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </div>

            <main className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">

                {/* ALERTAS DEL SISTEMA */}
                <div className="space-y-4 mb-6">
                    {/* Alerta de Pagos */}
                    {pendingReviewCount > 0 && (
                        <Alert className="bg-orange-50 border-orange-200 text-orange-800">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Revisión de Pagos</AlertTitle>
                            <AlertDescription>
                                Tienes <b>{pendingReviewCount}</b> pago(s) pendiente(s) de revisión.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Alerta de BACKORDER (NUEVA) */}
                    {hasBackorders && (
                        <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="font-bold">Stock Pendiente (Backorder)</AlertTitle>
                            <AlertDescription>
                                Este pedido contiene productos que no pudieron surtirse completos. Revisa el detalle de productos.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUMNA IZQUIERDA: Detalle Logístico y Productos */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. PRODUCTOS (Con lógica de Stock) */}
                        <Card className="shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
                            <CardHeader className="bg-gray-50/50 border-b py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Package className="h-4 w-4 text-gray-500" /> Productos y Disponibilidad
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-white">{order.items.length} ítems</Badge>
                                </div>
                            </CardHeader>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-gray-50/30 transition-colors">
                                        {/* Imagen y Datos Básicos */}
                                        <div className="h-16 w-16 shrink-0 border rounded bg-white p-1">
                                            <img
                                                src={getImageUrl(item.imageUrl)}
                                                alt={item.productName}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {item.sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block font-bold text-sm">x{item.quantity}</span>
                                                    <span className="text-xs text-gray-500">Solicitado</span>
                                                </div>
                                            </div>

                                            {/* BARRA DE ESTADO DE INVENTARIO */}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {/* Entregado */}
                                                {(item.quantityDelivered ?? 0) > 0 && (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-normal">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Entregado: <b>{item.quantityDelivered}</b>
                                                    </Badge>
                                                )}

                                                {/* Apartado / Listo */}
                                                {(item.quantityAllocated ?? 0) > 0 && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-normal">
                                                        <Box className="h-3 w-3" />
                                                        Apartado: <b>{item.quantityAllocated}</b>
                                                    </Badge>
                                                )}

                                                {/* Pendiente / Backorder */}
                                                {(item.quantityPending ?? 0) > 0 && (
                                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1 font-normal animate-pulse">
                                                        <Clock className="h-3 w-3" />
                                                        Pendiente: <b>{item.quantityPending}</b>
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* 2. Información del Cliente y Envío */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" /> Cliente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                            {order.user?.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{order.user?.fullName}</p>
                                            <p className="text-[10px] text-gray-500">ID: {order.user?.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3" /> {order.user?.email}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5" /> Envío
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {shippingInfo ? (
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p className="font-medium text-gray-900">
                                                {shippingInfo.street} {shippingInfo.exteriorNumber}
                                            </p>
                                            <p>{shippingInfo.neighborhood}</p>
                                            <p>{shippingInfo.city}, {shippingInfo.state}</p>
                                            <p className="text-xs text-gray-400 font-mono">CP: {shippingInfo.zipCode}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Sin dirección (Digital/Recolección)</p>
                                    )}
                                </CardContent>
                            </Card>
                            {
                                order.purchaseOrderUrl && (
                                    <Card className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5" /> Orden de Compra
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <a className="text-primary hover:underline text-sm flex items-center gap-2" href={getImageUrl(order.purchaseOrderUrl)} target="_blank" rel="noopener noreferrer">
                                                <Eye className="h-3.5 w-3.5" />
                                                Ver Orden de Compra
                                            </a>
                                        </CardContent>
                                    </Card>
                                )
                            }

                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Financiero y Pagos */}
                    <div className="space-y-6">

                        {/* 1. Resumen Financiero */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">Total a Cobrar</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-gray-500">Monto Total</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.totalAmount)}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pagado:</span>
                                        <span className="font-medium text-green-600">
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.paidAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="text-gray-600 font-bold">Saldo Pendiente:</span>
                                        <span className={cn("font-bold", order.balance > 0 ? "text-red-600" : "text-gray-400")}>
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.balance)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Conciliación de Pagos */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Pagos Reportados
                                </h3>
                                <Badge variant="secondary" className="text-xs">{payments.length}</Badge>
                            </div>

                            <div className="space-y-3">
                                {payments.length > 0 ? (
                                    payments.map((payment: any) => (
                                        <PaymentReviewCard
                                            key={payment.id}
                                            payment={payment}
                                            onReview={reviewPaymentMutation.mutate}
                                            isReviewing={reviewPaymentMutation.isPending}
                                        />
                                    ))
                                ) : (
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                                        <p className="text-sm text-gray-400">No hay pagos para revisar</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <InternalInvoiceDialog
                orderId={order.id}
                open={internalInvoiceOpen}
                onOpenChange={setInternalInvoiceOpen}
            />

            <ShipmentDialog
                open={shipmentDialogOpen}
                onOpenChange={setShipmentDialogOpen}
                orderItems={order.items || []}
                onConfirm={handleRegisterShipment}
                isPending={registerShipmentMutation.isPending}
            />
        </div>
    );
};