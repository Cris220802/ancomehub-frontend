import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFiscal } from '@/pages/client/hooks/useFiscal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    FileText,
    Code,
    CreditCard,
    Calendar,
    Hash,
    Receipt,
    ExternalLink,
    Copy,
    Check,
    AlertCircle,
    Download,
    Loader2 // Importamos el loader
} from 'lucide-react';
import { FiscalStatus } from '@/types/fiscal';
import { cn, getImageUrl } from '@/lib/utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
// IMPORTANTE: Importa tu nueva utilidad
import { downloadFileFromUrl } from '@/lib/utils';

const statusConfig: Record<FiscalStatus, { label: string; color: string; icon: React.ElementType }> = {
    PENDING: { label: 'Por Pagar', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
    PARTIALLY_PAID: { label: 'Pago Parcial', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Receipt },
    PAID: { label: 'Pagado Totalmente', color: 'bg-green-100 text-green-800 border-green-200', icon: Check },
    CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },
};

export const FiscalDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { useInvoiceDetail } = useFiscal();
    const { data: fiscal, isLoading, isError } = useInvoiceDetail(id || '');

    const [copied, setCopied] = useState(false);
    // Estado para controlar qué archivo se está descargando (evita múltiples clics)
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleCopyUuid = () => {
        if (fiscal?.fiscalUuid) {
            navigator.clipboard.writeText(fiscal.fiscalUuid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Función wrapper para manejar la descarga en la UI
    const handleFileDownload = async (urlPath: string, uuid: string, type: 'xml' | 'pdf', uniqueId: string) => {
        if (!urlPath) return;

        try {
            setDownloadingId(uniqueId); // Activamos spinner para este botón específico
            const fullUrl = getImageUrl(urlPath);
            const filename = `Factura-${uuid}.${type}`;

            await downloadFileFromUrl(fullUrl, filename);

            toast.success(`Archivo ${type.toUpperCase()} descargado`);
        } catch (error) {
            console.error("Fallo descarga directa, usando fallback:", error);
            // Fallback: abrir en nueva pestaña si falla CORS o fetch
            window.open(getImageUrl(urlPath), '_blank');
        } finally {
            setDownloadingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 rounded-xl md:col-span-2" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (isError || !fiscal) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <FileText className="h-12 w-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Documento no encontrado</h2>
                <p className="text-gray-500 mt-2 max-w-md">La factura que buscas no existe o no tienes permisos.</p>
                <Link to="/fiscal" className="mt-8">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Volver a mis facturas
                    </Button>
                </Link>
            </div>
        );
    }

    const currentStatus = statusConfig[fiscal.status] || { label: fiscal.status, color: 'bg-gray-100', icon: AlertCircle };
    const StatusIcon = currentStatus.icon;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in duration-500 space-y-8">

            {/* HEADER & ACTIONS */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex flex-col gap-2">
                    <Link to="/fiscal" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit">
                        <ArrowLeft className="h-4 w-4" /> Volver al listado
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Detalle de Factura
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-muted-foreground text-sm">Emitida el {new Date(fiscal.uploadedAt || '').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span className="text-gray-300">•</span>
                                <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", currentStatus.color)}>
                                    <StatusIcon className="h-3 w-3" /> {currentStatus.label}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN PRINCIPALES */}
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    {fiscal.xmlUrl && (
                        <Button
                            variant="outline"
                            className="flex-1 lg:flex-none border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary"
                            disabled={downloadingId === 'main-xml'}
                            onClick={() => handleFileDownload(fiscal.xmlUrl!, fiscal.fiscalUuid, 'xml', 'main-xml')}
                        >
                            {downloadingId === 'main-xml' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Code className="mr-2 h-4 w-4" />}
                            Descargar XML
                        </Button>
                    )}
                    {fiscal.pdfUrl && (
                        <Button
                            className="flex-1 lg:flex-none shadow-sm bg-primary hover:bg-primary/90"
                            disabled={downloadingId === 'main-pdf'}
                            onClick={() => handleFileDownload(fiscal.pdfUrl!, fiscal.fiscalUuid, 'pdf', 'main-pdf')}
                        >
                            {downloadingId === 'main-pdf' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Descargar PDF
                        </Button>
                    )}
                    {fiscal.pdfUrl && (
                        <Button
                            className="flex-1 lg:flex-none shadow-sm bg-primary hover:bg-primary/90"
                            disabled={downloadingId === 'main-pdf'}
                            onClick={() => window.open(getImageUrl(fiscal.pdfUrl), '_blank')}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Factura
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMN 1 & 2: MAIN INFO */}
                <div className="lg:col-span-2 space-y-6">

                    {/* General Info Card */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-gray-50/50">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                                <FileText className="h-4 w-4" /> Datos Fiscales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-medium uppercase">Folio Fiscal (UUID)</label>
                                <div className="flex items-center gap-2">
                                    <code className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded truncate max-w-[200px] md:max-w-full block">
                                        {fiscal.fiscalUuid}
                                    </code>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopyUuid}>
                                                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Copiar UUID</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-medium uppercase">Tipo de Comprobante</label>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono">{fiscal.type === 'INVOICE' ? 'Factura' : ''}</Badge>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-medium uppercase">Origen</label>
                                {fiscal.order ? (
                                    <Link
                                        to={`/orders/${fiscal.order.id}`}
                                        className="group flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                                    >
                                        Pedido #{fiscal.order.folio || 'N/A'}
                                        <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                    </Link>
                                ) : (
                                    <span className="text-sm text-gray-900">Directo</span>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-medium uppercase">Fecha de Emisión</label>
                                <p className="text-sm text-gray-900 font-medium">
                                    {new Date(fiscal.uploadedAt || '').toLocaleString('es-MX')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Payments (REPs) */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-gray-50/50">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                                <Hash className="h-4 w-4" /> Complementos de Pago
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {fiscal.relatedDocuments && fiscal.relatedDocuments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 border-b">
                                            <tr>
                                                <th className="px-6 py-3 font-medium whitespace-nowrap">Fecha</th>
                                                <th className="px-6 py-3 font-medium">UUID</th>
                                                <th className="px-6 py-3 font-medium text-right">Monto</th>
                                                <th className="px-6 py-3 font-medium text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {fiscal.relatedDocuments.map((doc) => (
                                                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {new Date(doc.uploadedAt || '').toLocaleDateString('es-MX')}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[150px]">
                                                        {doc.fiscalUuid}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(doc.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-8">
                                                            {doc.xmlUrl && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-16 hover:text-blue-600"
                                                                    disabled={downloadingId === `rep-xml-${doc.id}`}
                                                                    onClick={() => handleFileDownload(doc.xmlUrl!, doc.fiscalUuid, 'xml', `rep-xml-${doc.id}`)}
                                                                >
                                                                    {downloadingId === `rep-xml-${doc.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code className="h-4 w-4" />}
                                                                    XML
                                                                </Button>
                                                            )}
                                                            {doc.pdfUrl && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-16 hover:text-red-600"
                                                                    disabled={downloadingId === `rep-pdf-${doc.id}`}
                                                                    onClick={() => handleFileDownload(doc.pdfUrl!, doc.fiscalUuid, 'pdf', `rep-pdf-${doc.id}`)}
                                                                >
                                                                    {downloadingId === `rep-pdf-${doc.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                                                    PDF
                                                                </Button>
                                                            )}

                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="bg-gray-50 p-3 rounded-full mb-3">
                                        <Receipt className="h-6 w-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 text-sm">No hay complementos de pago asociados.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* COLUMN 3: FINANCIAL SUMMARY */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden h-fit">
                        <CardHeader className="pb-3 border-b bg-gray-50/50">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                                <CreditCard className="h-4 w-4" /> Desglose
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-gray-900 font-medium">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(fiscal.amount / 1.16)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">IVA (16%)</span>
                                    <span className="text-gray-900 font-medium">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(fiscal.amount - (fiscal.amount / 1.16))}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-gray-900 text-base">Total</span>
                                    <span className="text-2xl font-bold text-primary tracking-tight">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(fiscal.amount)}
                                    </span>
                                </div>

                                <div className={cn("mt-4 p-3 rounded-md text-xs font-medium text-center border",
                                    fiscal.status === 'PAID' ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-600 border-gray-100"
                                )}>
                                    {fiscal.status === 'PAID'
                                        ? "Factura liquidada totalmente"
                                        : "Saldo pendiente por liquidar"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};