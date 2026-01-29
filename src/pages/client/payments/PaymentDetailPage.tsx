import { useParams, Link } from 'react-router-dom';
import { usePayments } from '@/pages/client/hooks/usePayments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
    ArrowLeft,
    CreditCard,
    FileText,
    AlertTriangle,
    Eye
} from 'lucide-react';
import { PaymentMethodPayment, PaymentStatus } from '@/types/payments';
import { cn, getImageUrl } from '@/lib/utils';

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

const paymentMethodLabels: Record<PaymentMethodPayment, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia Bancaria',
    CREDIT: 'Tarjeta de Crédito',
    CHECK: 'Cheque',
    DEPOSIT: 'Depósito',
};

export const PaymentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { usePaymentDetail } = usePayments();
    const { data: payment, isLoading, isError } = usePaymentDetail(id || '');

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-64 bg-gray-200 rounded-lg" />
                    <div className="h-64 bg-gray-200 rounded-lg" />
                </div>
            </div>
        );
    }

    if (isError || !payment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Pago no encontrado</h2>
                <Link to="/orders" className="mt-4 text-primary hover:underline">
                    Volver a mis pedidos
                </Link>
            </div>
        );
    }

    const proofUrl = payment.proofUrl ? getImageUrl(payment.proofUrl) : null;
    const isPdf = proofUrl?.toLowerCase().endsWith('.pdf');

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">

                {/* Header Navigation */}
                <div className="mb-8">
                    <nav className="flex items-center text-sm text-gray-500 mb-4">
                        <Link to={`/orders/${payment.order.id}`} className="hover:text-gray-900 flex items-center transition-colors">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver al Pedido
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-gray-900">Detalle de Pago</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Pago Registrado
                            </h1>
                            <Badge variant="outline" className={cn("text-sm px-3 py-1", paymentStatusColors[payment.status])}>
                                {paymentStatusLabels[payment.status]}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                            ID: <span className="font-mono">{payment.id.split('-')[0]}...</span>
                        </p>
                    </div>
                </div>

                {/* Rejected Alert */}
                {payment.status === 'REJECTED' && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-800">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-sm">Pago Rechazado</h3>
                            {payment.rejectionReason && (
                                <p className="text-sm mt-1">{payment.rejectionReason}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Detalles */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                Información General
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Monto Reportado</span>
                                    <span className="font-bold text-lg text-gray-900">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payment.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Método de Pago</span>
                                    <span className="font-medium text-gray-900">{paymentMethodLabels[payment.method]}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Fecha de Registro</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(payment.createdAt).toLocaleString('es-MX')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {payment.notes && (
                            <div>
                                <h3 className="font-semibold text-sm text-gray-900 mb-2">Notas del Cliente</h3>
                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                                    "{payment.notes}"
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Comprobante */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Comprobante Adjunto
                        </h3>

                        <div className="flex-1 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center p-4 min-h-[200px] relative group overflow-hidden">
                            {proofUrl ? (
                                isPdf ? (
                                    <div className="text-center">
                                        <FileText className="h-16 w-16 text-red-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-900">Archivo PDF</p>
                                        <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => window.open(proofUrl, '_blank')}>
                                            <Eye className="h-4 w-4" />
                                            Ver Documento
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={proofUrl}
                                            alt="Comprobante"
                                            className="max-w-full max-h-[300px] object-contain rounded"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="secondary" size="sm" className="gap-2" onClick={() => window.open(proofUrl, '_blank')}>
                                                <Eye className="h-4 w-4" />
                                                Ver Pantalla Completa
                                            </Button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <p className="text-gray-400 text-sm">No hay comprobante disponible</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
