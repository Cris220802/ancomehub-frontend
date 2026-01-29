import { useParams, Link } from 'react-router-dom';
import { useOrders } from '@/pages/client/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, ShoppingCart, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { QuoteConversionDialog } from './QuoteConversionDialog';

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusLabels: Record<string, string> = {
    PENDING: 'Borrador',
    CONFIRMED: 'Aprobada',
};

export const QuoteDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { useQuoteDetail, downloadQuotePdf, isDownloadingQuotePdf } = useOrders();
    const { data: quote, isLoading, isError } = useQuoteDetail(id || '');

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !quote) {
        return <div className="text-center py-10 text-red-500">Error al cargar la cotización.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link to="/quotes" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Mis Cotizaciones
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Cotización #{quote.folio}</h1>
                        <p className="text-sm text-gray-500 mt-1">Emitida el {new Date(quote.createdAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
                    </div>
                    {/* <Badge variant="outline" className={`px-4 py-1.5 text-sm font-medium border ${statusColors[quote.status] || 'bg-gray-100'}`}>
                        {statusLabels[quote.status] || quote.status}
                    </Badge> */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items List */}
                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b bg-gray-50/50">
                            <h2 className="font-semibold text-gray-900">Productos Cotizados</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {quote.items.map((item) => (
                                <div key={item.id} className="p-6 flex gap-4">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <img
                                            src={getImageUrl(item.imageUrl) || '/placeholder.png'}
                                            alt={item.productName || 'Producto'}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3 className="line-clamp-2">{item.productName}</h3>
                                                <p className="ml-4 tabular-nums">
                                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPriceSnapshot * item.quantity)}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">SKU: {item.sku}</p>
                                        </div>
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <p className="text-gray-500">
                                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPriceSnapshot)} x {item.quantity} u.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">
                    <div className="bg-white border rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Cotización</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(quote.totalAmount / 1.16)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>IVA (16%)</span>
                                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(quote.totalAmount - (quote.totalAmount / 1.16))}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between text-base font-bold text-gray-900">
                                <span>Total Estimado</span>
                                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(quote.totalAmount)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 space-y-3">
                            {/* Convert to Order Logic */}
                            <QuoteConversionDialog quote={quote}>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Convertir en Pedido
                                </Button>
                            </QuoteConversionDialog>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => downloadQuotePdf({ id: quote.id, folio: quote.folio })}
                                disabled={isDownloadingQuotePdf}
                            >
                                {isDownloadingQuotePdf ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                {isDownloadingQuotePdf ? 'Descargando...' : 'Descargar PDF'}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                        <p className="text-xs text-amber-800">
                            <strong>Nota:</strong> Esta cotización es válida por 15 días a partir de la fecha de emisión. Los precios y disponibilidad están sujetos a cambios.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
