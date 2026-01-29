import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdminFiscal } from "../hooks/useAdminFiscal";
import { FiscalStatus } from "@/types/fiscal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    ArrowLeft,
    FileText,
    Trash2,
    Plus,
    Calendar,
    User,
    CreditCard,
    Copy,
    Check,
    Receipt,
    ExternalLink,
    Code,
    AlertCircle,
    Download
} from "lucide-react";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ComplementDialog } from "./components/ComplementDialog";

const statusConfig: Record<FiscalStatus, { label: string; color: string; icon: React.ElementType }> = {
    PENDING: { label: 'Pendiente de Pago', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
    PARTIALLY_PAID: { label: 'Parcialmente Pagado', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Receipt },
    PAID: { label: 'Pagado Completo', color: 'bg-green-100 text-green-800 border-green-200', icon: Check },
    CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200', icon: Trash2 },
};

export const FiscalAdminDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { useFiscalDetail, useUpdateFiscalStatus, useCancelFiscal } = useAdminFiscal();
    const [complementOpen, setComplementOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data: fiscal, isLoading } = useFiscalDetail(id || '');
    const updateStatusMutation = useUpdateFiscalStatus();
    const cancelMutation = useCancelFiscal();

    const handleStatusChange = (status: FiscalStatus) => {
        if (id) updateStatusMutation.mutate({ id, status });
    };

    const handleCancel = () => {
        if (id) cancelMutation.mutate(id);
    };

    const handleCopyUuid = () => {
        if (fiscal?.fiscalUuid) {
            navigator.clipboard.writeText(fiscal.fiscalUuid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="h-64 w-full bg-gray-100 rounded animate-pulse md:col-span-2"></div>
                    <div className="h-64 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!fiscal) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-96">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Documento no encontrado</h3>
                <Link to="/admin/fiscal" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
                    Volver al listado
                </Link>
            </div>
        );
    }

    const currentStatus = statusConfig[fiscal.status] || { label: fiscal.status, color: 'bg-gray-100', icon: AlertCircle };
    const StatusIcon = currentStatus.icon;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/admin/fiscal" className="text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Detalle de Factura</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("px-2.5 py-0.5 flex items-center gap-1.5 text-sm", currentStatus.color)}>
                            <StatusIcon className="h-3.5 w-3.5" /> {currentStatus.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {new Date(fiscal.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    {/* Selector de Estatus */}
                    <div className="w-[180px]">
                        <Select
                            value={fiscal.status}
                            onValueChange={(val) => handleStatusChange(val as FiscalStatus)}
                            disabled={updateStatusMutation.isPending || fiscal.status === 'CANCELLED'}
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Estatus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pendiente</SelectItem>
                                <SelectItem value="PARTIALLY_PAID">Parcial</SelectItem>
                                <SelectItem value="PAID">Pagado</SelectItem>
                                <SelectItem value="CANCELLED" disabled>Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Botón Cancelar */}
                    {fiscal.status !== 'CANCELLED' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/20">
                                    <Trash2 className="h-4 w-4 mr-2" /> Cancelar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Cancelar Factura ante el SAT?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción iniciará el proceso de cancelación del UUID <strong>{fiscal.fiscalUuid}</strong>.
                                        Esta acción es irreversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Volver</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Sí, Cancelar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Columna Izquierda: Detalles Financieros y Archivos */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Tarjeta de Resumen (Hero) */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">Información Fiscal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-lg border">
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Folio Fiscal (UUID)</span>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border">{fiscal.fiscalUuid}</code>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={handleCopyUuid} className="h-8 w-8">
                                                        {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Copiar UUID</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Monto Total</span>
                                    <span className="text-3xl font-bold tracking-tight">${fiscal.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a
                                    href={fiscal.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(buttonVariants({ variant: "default" }), "w-full justify-center")}
                                >
                                    <FileText className="mr-2 h-4 w-4" /> Descargar PDF
                                </a>
                                <a
                                    href={fiscal.xmlUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
                                >
                                    <Code className="mr-2 h-4 w-4" /> Descargar XML
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla de Complementos */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight">Complementos de Pago</h3>
                                <p className="text-sm text-muted-foreground">Historial de pagos registrados (REP).</p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setComplementOpen(true)}
                                disabled={fiscal.status === 'CANCELLED' || fiscal.status === 'PAID'}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Nuevo Pago
                            </Button>
                        </div>

                        <Card>
                            <div className="overflow-hidden">
                                {fiscal.relatedDocuments && fiscal.relatedDocuments.length > 0 ? (
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>UUID</TableHead>
                                                <TableHead className="text-right">Monto</TableHead>
                                                <TableHead className="text-right">Archivos</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fiscal.relatedDocuments.map((doc) => (
                                                <TableRow key={doc.id}>
                                                    <TableCell className="font-medium">
                                                        {new Date(doc.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {doc.fiscalUuid.split('-')[0]}...
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        ${doc.amount.toLocaleString('es-MX')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <a href={doc.pdfUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-muted-foreground hover:text-primary")}>
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                            <a href={doc.xmlUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-muted-foreground hover:text-primary")}>
                                                                <Code className="h-4 w-4" />
                                                            </a>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                        <CreditCard className="h-10 w-10 mb-3 opacity-20" />
                                        <p className="text-sm">No hay complementos de pago registrados.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Columna Derecha: Contexto y Desglose */}
                <div className="space-y-8">

                    {/* Cliente y Orden */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contexto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <User className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Cliente</p>
                                    <p className="text-sm text-muted-foreground">{fiscal.order?.user?.fullName || 'Cliente Externo'}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{fiscal.order?.user?.email}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Receipt className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Origen</p>
                                    {fiscal.order ? (
                                        <Link to={`/admin/orders/${fiscal.order.id}`} className="group flex items-center gap-1 text-sm text-primary hover:underline">
                                            Orden #{fiscal.order.folio}
                                            <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                        </Link>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Sin orden vinculada</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Desglose */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Desglose</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">${(fiscal.amount / 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">IVA (16%)</span>
                                <span className="font-medium">${(fiscal.amount - (fiscal.amount / 1.16)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Total</span>
                                <span className="text-xl font-bold">${fiscal.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                <div>
                                    <span className="block font-semibold text-gray-700">Tipo</span>
                                    {fiscal.type}
                                </div>
                                <div className="text-right">
                                    <span className="block font-semibold text-gray-700">Método</span>
                                    PUE
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ComplementDialog
                parentId={fiscal.id}
                open={complementOpen}
                onOpenChange={setComplementOpen}
            />
        </div>
    );
};