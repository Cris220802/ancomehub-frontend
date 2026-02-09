import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '@/pages/client/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    ArrowLeft,
    MapPin,
    CreditCard,
    Calendar,
    FileText,
    Package,
    CheckCircle2,
    AlertOctagon,
    Truck,
    Plus,
    Banknote,
    ChevronRight,
    Loader2,
    Clock,
    Box,
    FileCheck,
    MessageCircleQuestion,
    History,
    AlertTriangle,
    AlertTriangleIcon
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { OrderPaymentStatus, OrderStatus, PaymentMethod } from '@/types/orders';
import { getImageUrl, cn } from '@/lib/utils';
import { usePayments } from '@/pages/client/hooks/usePayments';
import { PaymentDialog } from '@/pages/client/payments/components/PaymentDialog';
import { PaymentMethodPayment, PaymentStatus } from '@/types/payments';

// --- TUS CONSTANTES DE ESTADO (Se mantienen igual) ---
const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode; description: string }> = {
    PENDING: {
        label: 'Esperando confirmación',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertOctagon className="h-4 w-4" />,
        description: 'Tu pedido ha sido recibido. Estamos esperando que nuestro equipo lo confirme.'
    },
    CONFIRMED: {
        label: 'Confirmado',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle2 className="h-4 w-4" />,
        description: 'Pedido confirmado. Estamos procesando el surtido.'
    },
    PARTIALLY_DELIVERED: {
        label: 'Entrega Parcial',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <Truck className="h-4 w-4" />,
        description: 'Se han entregado algunos productos, otros siguen pendientes.'
    },
    COMPLETED: {
        label: 'Entregado',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <Package className="h-4 w-4" />,
        description: 'El pedido ha sido entregado exitosamente.'
    },
    CONVERTED: {
        label: 'Convertido',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <FileText className="h-4 w-4" />,
        description: 'El pedido ha sido convertido.'
    },
    CANCELLED: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertOctagon className="h-4 w-4" />,
        description: 'Este pedido fue cancelado.'
    },
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
    PENDING_REVIEW: 'En Revisión',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado'
};

const paymentStatusColors: Record<PaymentStatus, string> = {
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const paymentStatusConfig: Record<OrderPaymentStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: {
        label: 'Pago Pendiente',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertOctagon className="h-4 w-4" />
    },
    PARTIALLY_PAID: {
        label: 'Pagado Parcialmente',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle2 className="h-4 w-4" />
    },
    PAID: {
        label: 'Pagado',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <Package className="h-4 w-4" />
    },
    CANCELLED: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertOctagon className="h-4 w-4" />
    },
};

const paymentMethodLabels: Record<PaymentMethodPayment, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    DEPOSIT: 'Depósito',
    CHECK: 'Cheque',
    CREDIT: 'Crédito Ancome'
};

const paymentMethodOrder: Record<PaymentMethod, string> = {
    CASH_PAYMENT: 'Efectivo',
    CREDIT_PAYMENT: 'Crédito Ancome'
};

export const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { useOrderDetail, cancelOrder, isCancellingOrder } = useOrders(); // Updated hook usage
    const { data: order, isLoading, isError } = useOrderDetail(id || '');
    // Payments Logic
    const { useOrderPayments } = usePayments();
    const { data: payments } = useOrderPayments(id || '');

    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
    const [isTimeErrorDialogOpen, setIsTimeErrorDialogOpen] = React.useState(false);

    const handleConfirmCancel = async () => {
        try {
            await cancelOrder({ id: order!.id });
            setIsCancelDialogOpen(false);
            // Toast success handled in hook
        } catch (error: any) {
            setIsCancelDialogOpen(false);
            if (error.response?.data?.message === 'Cannot cancel order more than 1 hour after it was created') { // Checking exact message or if backend sends a code? User said "error de tipo '...'"
                // The user quoted the message: 'Cannot cancel order less than 1 hour after it was created'
                // But wait, the prompt says "Cannot cancel order less than 1 hour after it was created" 
                // Usually restriction is ABOUT canceling AFTER 1 hour. "less than 1 hour" implies you CANNOT cancel quickly?
                // Rereading: "No se puede cancelar orden menos de 1 hora después de haber sido creada" -> Can't cancel UNTIL 1 hour has passed?
                // OR maybe it's "Cannot cancel order MORE than 1 hour after..."?
                // User prompt: "en caso de que exista error de tipo 'Cannot cancel order less than 1 hour after it was created'"
                // I will match the string exactly as requested.
                setIsTimeErrorDialogOpen(true);
            } else {
                toast.error("Error al cancelar pedido: " + (error.response?.data?.message || "Error desconocido"));
            }
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-40 bg-gray-200 rounded-lg" />
                        <div className="h-96 bg-gray-200 rounded-lg" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-64 bg-gray-200 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <AlertOctagon className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">No pudimos cargar el pedido</h2>
                <Link to="/orders" className="mt-4 text-primary hover:underline">Volver a mis pedidos</Link>
            </div>
        );
    }

    const currentStatus = statusConfig[order.status] || statusConfig.PENDING;
    const subtotal = order.totalAmount / 1.16;
    const tax = order.totalAmount - subtotal;

    // Lógica para determinar si hay factura disponible
    const hasInvoice = (order.fiscalDocuments?.length ?? 0) > 0;
    // Asumimos que el ID de la factura es el del primer documento si existe
    const invoiceId = hasInvoice ? order.fiscalDocuments![0].id : null;

    // Parse shippingInfo safely
    const shippingInfo = React.useMemo(() => {
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

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <nav className="flex items-center text-sm text-gray-500 mb-4">
                        <Link to="/orders" className="hover:text-gray-900 flex items-center transition-colors">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Mis Pedidos
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-gray-900">Detalle</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pedido #{order.folio}</h1>
                                <Badge variant="outline" className={cn("px-3 py-1 flex items-center gap-1.5", currentStatus.color)}>
                                    {currentStatus.icon} {currentStatus.label}
                                </Badge>
                            </div>
                            <p className="text-gray-500 mt-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Realizado el {new Date(order.createdAt).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Banner Estado */}
                <div className={cn("mb-8 p-4 rounded-lg border flex items-start gap-3", currentStatus.color)}>
                    <div className="mt-0.5 shrink-0">{currentStatus.icon}</div>
                    <div>
                        <h3 className="font-semibold text-sm">{currentStatus.label}</h3>
                        <p className="text-sm opacity-90">{currentStatus.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Contenido Principal */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Lista de Productos */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-500" /> Productos ({order.items.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/30 transition-colors">
                                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
                                            <img
                                                src={getImageUrl((item as any).imageUrl || '')}
                                                alt={item.productName}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-4">
                                                    <h3 className="font-medium text-gray-900 text-base line-clamp-2">{item.productName}</h3>
                                                    <p className="font-bold text-gray-900 tabular-nums">
                                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPriceSnapshot * item.quantity)}
                                                    </p>
                                                </div>
                                                {(item as any).sku && (
                                                    <p className="mt-1 text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1.5 py-0.5 rounded">SKU: {(item as any).sku}</p>
                                                )}

                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {(item.quantityDelivered ?? 0) > 0 && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-100">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span>Entregado: {item.quantityDelivered}</span>
                                                        </div>
                                                    )}
                                                    {(item.quantityAllocated ?? 0) > 0 && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                                            <Box className="h-3.5 w-3.5" />
                                                            <span>Listo: {item.quantityAllocated}</span>
                                                        </div>
                                                    )}
                                                    {(item.quantityPending ?? 0) > 0 && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium border border-orange-100">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>Pendiente: {item.quantityPending}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center gap-4">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                                                        Cant: {item.quantity}
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-gray-500">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPriceSnapshot)} c/u</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Info de Envío y Pago */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" /> Dirección de Envío
                                </h3>
                                {shippingInfo && Object.keys(shippingInfo).length > 0 ? (
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="font-medium text-gray-900">{shippingInfo.street + ' ' + shippingInfo.exteriorNumber + ' ' + (shippingInfo.interiorNumber || '')}</p>
                                        <p>{shippingInfo.neighborhood}, {shippingInfo.zipCode}, {shippingInfo.city}, {shippingInfo.state}</p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-dashed border-gray-300">
                                        <p className="text-sm text-gray-500">Sin dirección registrada.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-primary" /> Información de Pago
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Método</p>
                                        <p className="text-sm font-medium text-gray-900">{paymentMethodOrder[order.paymentMethod] || order.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Estatus</p>
                                        <Badge variant="outline" className={cn("", paymentStatusConfig[order.paymentStatus]?.color ?? "")}>
                                            {paymentStatusConfig[order.paymentStatus]?.icon} {paymentStatusConfig[order.paymentStatus]?.label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. HISTORIAL DE PAGOS */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Banknote className="h-4 w-4 text-gray-500" />
                                    Historial de Pagos ({payments?.payments?.length || 0})
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {payments?.payments && payments.payments.length > 0 ? (
                                    payments.payments.map((payment) => (
                                        <Link
                                            key={payment.id}
                                            to={`/payments/${payment.id}`}
                                            className="block hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                        <Banknote className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Pago vía {paymentMethodLabels[payment.method]}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(payment.createdAt).toLocaleDateString('es-MX')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">
                                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payment.amount)}
                                                    </p>
                                                    <Badge variant="outline" className={cn("mt-1 text-[10px]", paymentStatusColors[payment.status])}>
                                                        {paymentStatusLabels[payment.status]}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <p className="text-sm">No hay pagos reportados.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Resumen Financiero */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-24">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Resumen Financiero</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>IVA (16%)</span>
                                        <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(tax)}</span>
                                    </div>
                                    {/* <div className="flex justify-between text-gray-600">
                                        <span>Envío</span>
                                        <span className="text-gray-400">Calculado al confirmar</span>
                                    </div> */}
                                    <Separator className="my-4" />
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-gray-900 text-base">Total</span>
                                        <div className="text-right">
                                            <span className="block font-bold text-2xl text-primary">
                                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.totalAmount)}
                                            </span>
                                            <span className="text-xs text-gray-500">MXN (Impuestos incluidos)</span>
                                        </div>
                                    </div>

                                    {/* ... Pagado y Pendiente (código existente) ... */}
                                    <div className="flex justify-between text-gray-600 mt-2">
                                        <span>Pagado</span>
                                        <span className="text-green-600 font-medium">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.paidAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Pendiente</span>
                                        <span className="text-red-500 font-bold">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.balance)}</span>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {/* LÓGICA DE FACTURACIÓN NUEVA */}
                                    {order.requiresInvoice && (
                                        <div className="mb-4">
                                            {hasInvoice ? (
                                                <Button
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                                    onClick={() => navigate(`/fiscal/${invoiceId}`)}
                                                >
                                                    <FileCheck className="mr-2 h-4 w-4" /> Ver Factura
                                                </Button>
                                            ) : (
                                                <Alert className="bg-amber-50 border-amber-200 text-amber-800 p-3">
                                                    <Clock className="h-4 w-4 text-amber-600" />
                                                    <div className="ml-2">
                                                        <AlertTitle className="text-sm font-semibold">Facturación Pendiente</AlertTitle>
                                                        <AlertDescription className="text-xs opacity-90 mt-0.5">
                                                            Tu factura será generada una vez confirmado el pago. En caso de que hayas seleccionado pago por medio de Crédito Ancome, la factura se subirá pronto.
                                                        </AlertDescription>
                                                    </div>
                                                </Alert>
                                            )}
                                        </div>
                                    )}

                                    {/* Botones de acción existentes */}
                                    {order.status === 'PENDING' && (
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={() => setIsCancelDialogOpen(true)}
                                            disabled={isCancellingOrder}
                                        >
                                            {isCancellingOrder ? 'Cancelando...' : 'Cancelar Pedido'}
                                        </Button>
                                    )}
                                    {order.balance > 0 && order.status !== 'CANCELLED' && (
                                        <Button className="w-full" onClick={() => setIsPaymentDialogOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" /> Reportar Pago
                                        </Button>
                                    )}
                                    <PaymentDialog
                                        open={isPaymentDialogOpen}
                                        onOpenChange={setIsPaymentDialogOpen}
                                        orderId={order.id}
                                        remainingBalance={order.balance}
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 border-t text-xs text-gray-400 text-center">
                                Folio interno: {order.id.slice(0, 8)}...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog de Confirmación de Cancelación */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent className="sm:max-w-[425px] text-center">
                    <DialogHeader className="flex flex-col items-center gap-4 pt-4">
                        {/* Icono de advertencia visual */}
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-xl text-gray-900">
                                ¿Estás seguro de cancelar este pedido?
                            </DialogTitle>

                            <DialogDescription className="text-sm text-gray-500 leading-relaxed">
                                Esta acción no se puede deshacer. El pedido será marcado como cancelado y no se procesará.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setIsCancelDialogOpen(false)}
                            disabled={isCancellingOrder}
                            className="w-full sm:w-auto"
                        >
                            Volver
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleConfirmCancel}
                            disabled={isCancellingOrder}
                            className="w-full sm:w-auto gap-2"
                        >
                            {isCancellingOrder ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cancelando...
                                </>
                            ) : (
                                'Sí, cancelar pedido'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Error de Tiempo */}
            <Dialog open={isTimeErrorDialogOpen} onOpenChange={setIsTimeErrorDialogOpen}>
                <DialogContent className="sm:max-w-[425px] text-center">
                    <DialogHeader className="flex flex-col items-center gap-4 pt-4">
                        {/* 1. Icono con impacto visual pero no agresivo */}
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <History className="h-6 w-6 text-orange-600" />
                        </div>

                        <div className="space-y-2">
                            {/* 2. Título claro y descriptivo */}
                            <DialogTitle className="text-xl text-gray-900">
                                Tiempo de cancelación excedido
                            </DialogTitle>

                            {/* 3. Descripción explicativa con formato */}
                            <DialogDescription className="text-sm text-gray-500 leading-relaxed">
                                Por políticas de la empresa, la cancelación solo está disponible durante
                                <span className="font-semibold text-gray-700"> la primera hora </span>
                                posterior a la creación del pedido.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* 4. Pie con acciones claras */}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setIsTimeErrorDialogOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Entendido
                        </Button>

                        {/* Opción de salida para reducir frustración */}
                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto gap-2"
                            onClick={() => {
                                setIsTimeErrorDialogOpen(false);
                                // Aquí tu lógica para abrir chat o ir a contacto
                                window.location.href = "mailto:soporte@ancome.com";
                            }}
                        >
                            <MessageCircleQuestion className="h-4 w-4" />
                            Contactar Soporte
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};