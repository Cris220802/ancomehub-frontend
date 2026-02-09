import React, { useState, useRef } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// UI Components
import { Input } from '@/components/ui/Input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from '@/components/ui/switch';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

// Icons
import {
    CheckCircle2,
    Clock,
    ChevronLeft,
    RotateCw,
    Banknote,
    Wallet,
    MapPin,
    Plus,
    ArrowRight,
    AlertCircle,
    Upload,
    FileText,
    X,
    CreditCard,
    Check
} from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';
import { OrderDetail, OrderPreviewResponse, PaymentMethod } from '@/types/orders';
import { useOrders } from '@/pages/client/hooks/useOrders';
import { useClient } from '@/pages/client/hooks/useClient';
import { IncompleteProfileDialog } from '@/pages/client/components/IncompleteProfileDialog';

interface QuoteConversionDialogProps {
    quote: OrderDetail;
    children: React.ReactNode;
}

const paymentConfig: Record<PaymentMethod, { label: string; icon: any; description: string }> = {
    CASH_PAYMENT: { label: 'Pago de Contado', icon: Banknote, description: '' },
    CREDIT_PAYMENT: { label: 'Crédito Ancome', icon: Wallet, description: 'Línea de crédito Ancome' },
};

const formSchema = z.object({
    paymentMethod: z.enum(['CASH_PAYMENT', 'CREDIT_PAYMENT'] as const, {
        message: "Selecciona un método de pago.",
    }),
    requiresInvoice: z.boolean(),
    shippingAddressIndex: z.string().min(1, {
        message: "Debes seleccionar una dirección de entrega.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export const QuoteConversionDialog = ({ quote, children }: QuoteConversionDialogProps) => {
    // Si la cotización ya está convertida, mostramos un estado estático y no permitimos abrir el diálogo.
    if (quote.status === 'CONVERTED') {
        return (
            <Button variant="outline" className="w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 cursor-default" disabled>
                <Check className="mr-2 h-4 w-4" /> Cotización Convertida a Pedido
            </Button>
        );
    }

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'details' | 'preview'>('details');
    const [previewData, setPreviewData] = useState<OrderPreviewResponse | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorPreview, setErrorPreview] = useState<string | null>(null); // Errores del paso 1

    // Ref para el input de archivo oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        previewQuoteToOrder,
        isPreviewingQuoteToOrder,
        convertQuoteToOrder,
        isConvertingQuoteToOrder,
        showIncompleteProfileDialog,
        setShowIncompleteProfileDialog
    } = useOrders();

    const { shippingAddresses, isLoadingAddresses } = useClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            requiresInvoice: false,
            paymentMethod: quote.paymentMethod as PaymentMethod || undefined
        },
    });

    const resetState = () => {
        setStep('details');
        setPreviewData(null);
        setSelectedFile(null);
        setError(null);
        setErrorPreview(null);
        form.reset({
            requiresInvoice: false,
            paymentMethod: quote.paymentMethod as PaymentMethod || undefined
        });
    };

    const handleOpenChange = (open: boolean) => {
        if ((isConvertingQuoteToOrder || isPreviewingQuoteToOrder) && !open) return;
        setIsOpen(open);
        if (!open) resetState();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    // --- STEP 1: PREVIEW ---
    const onDetailsSubmit = async () => {
        setErrorPreview(null);
        try {
            const data = await previewQuoteToOrder(quote.id);
            setPreviewData(data);
            setStep('preview');
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message;

            if (message === 'Quote is expired') {
                setErrorPreview('La cotización ha expirado. Solicita una nueva actualización.');
            } else if (message === 'Quote is already converted') {
                setErrorPreview('Esta cotización ya ha sido convertida a pedido anteriormente.');
            } else if (message === 'You are not authorized to convert this quote') {
                setErrorPreview('No tienes permisos para convertir esta cotización.');
            } else if (message === 'User credit is disabled') {
                setErrorPreview('Tu crédito está deshabilitado. Contacta a tu asesor para más información.');
            } else {
                setErrorPreview('Ocurrió un error al procesar la solicitud. Por favor intenta de nuevo.');
            }
        }
    };

    const onDetailsErrors = (errors: FieldErrors<FormValues>) => {
        if (errors.shippingAddressIndex) toast.error("Debes seleccionar una dirección de entrega.");
        else if (errors.paymentMethod) toast.error("Selecciona un método de pago.");
    };

    // --- STEP 2: CONFIRM ---
    const onConfirmOrder = async () => {
        try {
            setError(null);
            const shippingIndex = form.getValues('shippingAddressIndex');
            const selectedAddress = shippingAddresses[parseInt(shippingIndex)];
            console.log(selectedAddress);
            await convertQuoteToOrder({
                id: quote.id,
                data: {
                    paymentMethod: form.getValues('paymentMethod'),
                    requiresInvoice: form.getValues('requiresInvoice'),
                    shippingInfo: selectedAddress,
                    file: selectedFile || undefined
                }
            });
            setIsOpen(false);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message;

            if (message === 'Order purchase document is required') {
                setError('Es obligatorio adjuntar la orden de compra en PDF.');
            } else if (message === 'You are not authorized to convert this quote') {
                setError('No tienes permisos para convertir esta cotización.');
            } else if (message === 'User credit is disabled') {
                setError('Debes cambiar tu método de pago seleccionado.Tu crédito Ancome está deshabilitado. Contacta a tu asesor de ventas asignado para más información.');
            } else {
                setError('Ocurrió un error al procesar la solicitud. Por favor intenta de nuevo.');
            }
        }
    };

    // File Handlers
    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error("Solo se permiten archivos PDF.");
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- RENDER COMPONENTS ---

    const ProgressBar = () => (
        <div className="flex items-center gap-2 mb-4">
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", step === 'details' ? 'bg-primary' : 'bg-primary/40')} />
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", step === 'preview' ? 'bg-primary' : 'bg-gray-100')} />
        </div>
    );

    const QuoteSummaryCard = () => (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm mt-4">
            <div className="bg-gray-50/50 px-4 py-3 border-b flex justify-between items-center">
                <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Resumen</span>
                <Badge variant="outline" className="font-mono">{quote.folio}</Badge>
            </div>
            <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Método de Pago</span>
                    <span className="font-medium flex items-center gap-2">
                        {form.getValues('paymentMethod') && paymentConfig[form.getValues('paymentMethod')] ? (
                            <>
                                {React.createElement(paymentConfig[form.getValues('paymentMethod')].icon, { className: "w-3 h-3" })}
                                {paymentConfig[form.getValues('paymentMethod')].label}
                            </>
                        ) : 'No seleccionado'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Factura</span>
                    <span className="font-medium">{form.getValues('requiresInvoice') ? 'Sí, requerida' : 'No requerida'}</span>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Envío a</span>
                    <span className="font-medium text-right max-w-[180px] text-xs truncate">
                        {shippingAddresses[parseInt(form.getValues('shippingAddressIndex'))]?.street || 'No seleccionado'}
                    </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-900 font-bold">Total a Pagar</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(quote.totalAmount)}</span>
                </div>
            </div>
        </div>
    );

    const renderSuccessPreview = () => (
        <div className="animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex flex-col items-center text-center space-y-2 mb-2">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-green-900 text-lg">Stock Disponible</h3>
                <p className="text-green-700 text-sm max-w-xs">Todos los productos están listos para envío inmediato.</p>
            </div>
            <QuoteSummaryCard />
        </div>
    );

    const renderBackorderPreview = (items: any[]) => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <Alert className="border-orange-200 bg-orange-50/50">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900 font-semibold">Entrega Parcial</AlertTitle>
                <AlertDescription className="text-orange-800 text-xs">Se enviará lo disponible ahora y el resto quedará pendiente.</AlertDescription>
            </Alert>
            <ScrollArea className="h-[200px] rounded-xl border bg-white">
                <div className="divide-y">
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 text-sm">
                            <div className="flex justify-between font-medium">
                                <span>{item.name || item.productId}</span>
                                <span className="text-blue-600">x{item.requested}</span>
                            </div>
                            <div className="flex gap-2 mt-1 text-xs">
                                <span className="text-green-600 font-medium">{item.allocated} Listos</span>
                                <span className="text-orange-600 font-medium">{item.pending} Pendientes</span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <QuoteSummaryCard />
        </div>
    );

    const renderErrorPreview = (items: any[]) => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900 font-semibold">Stock Insuficiente</AlertTitle>
                <AlertDescription className="text-red-800">No es posible procesar el pedido por falta de stock.</AlertDescription>
            </Alert>
            <ScrollArea className="h-[150px] w-full rounded-xl border p-4 bg-gray-50">
                <div className="space-y-3">
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-1 border-b border-gray-200 pb-2 last:border-0">
                            <span className="font-medium text-sm text-gray-900">{item.name || item.productId}</span>
                            <span className="text-xs text-red-600 font-medium">{item.error}</span>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                {/* MEJORA DE SCROLL: 
                    - max-h-[85vh]: Limita la altura del modal al 85% del viewport.
                    - flex flex-col: Permite que los hijos (header, body, footer) se apilen.
                */}
                <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">

                    {/* Header: Fijo */}
                    <div className="bg-gray-50/80 p-6 border-b shrink-0">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                {step === 'details' ? <CreditCard className="h-5 w-5 text-primary" /> : <RotateCw className="h-5 w-5 text-primary" />}
                                {step === 'details' ? 'Detalles de Compra' : 'Confirmación'}
                            </DialogTitle>
                            <DialogDescription>
                                {step === 'details' ? 'Verifica los datos para convertir tu cotización.' : 'Revisa disponibilidad y confirma.'}
                            </DialogDescription>
                        </DialogHeader>
                        <ProgressBar />
                    </div>

                    {/* Body: Scrolleable */}
                    <div className="p-6 flex-1 overflow-y-auto">
                        {step === 'details' && (
                            <Form {...form}>
                                <form id="quote-conversion-form" onSubmit={form.handleSubmit(onDetailsSubmit, onDetailsErrors)} className="space-y-8">

                                    {/* ALERTA DE ERRORES PASO 1 */}
                                    {errorPreview && (
                                        <Alert variant="destructive" className="bg-red-50 border-red-200 mb-6 animate-in slide-in-from-top-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>No se puede procesar</AlertTitle>
                                            <AlertDescription>{errorPreview}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* DIRECCIONES */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" /> Dirección de Envío
                                            </Label>
                                            <Link to="/client/profile" className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-primary/5">
                                                <Plus className="h-3 w-3" /> Nueva
                                            </Link>
                                        </div>

                                        {isLoadingAddresses ? (
                                            <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
                                        ) : shippingAddresses.length === 0 ? (
                                            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                                <MapPin className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                                <p className="text-sm text-gray-500 font-medium">No tienes direcciones guardadas.</p>
                                                <Link
                                                    to="/client/profile"
                                                    className={cn(buttonVariants({ variant: "link" }), "mt-1 h-auto p-0 text-primary")}
                                                >
                                                    Ir a Mi Perfil
                                                </Link>
                                            </div>
                                        ) : (
                                            <FormField
                                                control={form.control}
                                                name="shippingAddressIndex"
                                                render={({ field }) => (
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-3">
                                                        {shippingAddresses.map((addr, index) => (
                                                            <FormItem key={index}>
                                                                <FormControl>
                                                                    <RadioGroupItem value={index.toString()} className="peer sr-only" />
                                                                </FormControl>
                                                                <FormLabel className="flex items-start gap-4 rounded-xl border-2 border-transparent bg-gray-50 p-4 hover:bg-gray-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                                                    <div className="mt-1 h-4 w-4 rounded-full border border-gray-300 bg-white peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary shrink-0 transition-colors flex items-center justify-center">
                                                                        <div className="h-2 w-2 rounded-full bg-white opacity-0 peer-data-[state=checked]:opacity-100" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="font-bold text-sm text-gray-900 leading-tight">
                                                                            {addr.street} {addr.exteriorNumber}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {addr.neighborhood}, {addr.city} • CP {addr.zipCode}
                                                                        </p>
                                                                    </div>
                                                                </FormLabel>
                                                            </FormItem>
                                                        ))}
                                                    </RadioGroup>
                                                )}
                                            />
                                        )}
                                    </div>

                                    <Separator className="bg-gray-100" />

                                    {/* PAGOS */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                                            <Banknote className="h-4 w-4 text-primary" /> Método de Pago
                                        </Label>
                                        <FormField
                                            control={form.control}
                                            name="paymentMethod"
                                            render={({ field }) => (
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="grid grid-cols-2 gap-4"
                                                >
                                                    {Object.entries(paymentConfig).map(([key, config]) => {
                                                        const Icon = config.icon;
                                                        return (
                                                            <FormItem key={key}>
                                                                <FormControl>
                                                                    <RadioGroupItem value={key} className="peer sr-only" />
                                                                </FormControl>
                                                                <FormLabel className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-gray-100 bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-center h-full shadow-sm">
                                                                    <div className="p-2 bg-gray-100 rounded-full peer-data-[state=checked]:bg-primary/10">
                                                                        <Icon className="h-5 w-5 text-gray-500 peer-data-[state=checked]:text-primary" />
                                                                    </div>
                                                                    <span className="font-semibold text-sm peer-data-[state=checked]:text-primary text-gray-700">{config.label}</span>
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    })}
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    {/* FACTURA */}
                                    <FormField
                                        control={form.control}
                                        name="requiresInvoice"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200 p-4 shadow-sm bg-white">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-semibold text-gray-900">¿Requiere Factura?</FormLabel>
                                                    <p className="text-xs text-gray-500">Se usará tu RFC registrado para la facturación.</p>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        )}

                        {step === 'preview' && (
                            <div className="space-y-6">
                                {/* ALERTA DE ERRORES PASO 2 (Backend) */}
                                {error && (
                                    <Alert variant="destructive" className="bg-red-50 border-red-200 animate-in slide-in-from-top-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error al Confirmar</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {previewData && !previewData.canProceed && renderErrorPreview(previewData.items.filter((i: any) => i.status === 'ERROR'))}
                                {previewData && previewData.canProceed && previewData.hasBackorders && renderBackorderPreview(previewData.items.filter((i: any) => i.status === 'PARTIAL'))}
                                {previewData && previewData.canProceed && !previewData.hasBackorders && renderSuccessPreview()}
                            </div>
                        )}
                    </div>

                    {/* Footer: Fijo */}
                    <div className="bg-gray-50 p-6 border-t shrink-0">
                        {step === 'details' ? (
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total a Pagar</span>
                                    <span className="text-xl font-bold text-gray-900">{formatCurrency(quote.totalAmount)}</span>
                                </div>
                                <Button
                                    type="submit"
                                    form="quote-conversion-form"
                                    disabled={isPreviewingQuoteToOrder}
                                    className="px-8 shadow-md hover:shadow-lg transition-all"
                                    size="lg"
                                >
                                    {isPreviewingQuoteToOrder ? <Clock className="animate-spin h-4 w-4 mr-2" /> : <>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>}
                                    {isPreviewingQuoteToOrder && "Procesando..."}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* UPLOAD DE ARCHIVO */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold text-gray-800">Orden de Compra (PDF)</Label>
                                        <span className="text-xs text-center text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">Opcional, a menos que se requiera.</span>
                                    </div>

                                    <div
                                        onClick={handleFileClick}
                                        className={cn(
                                            "border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-gray-100 hover:border-primary/50 group bg-white",
                                            selectedFile ? "border-primary/50 bg-primary/5" : "",
                                            // Quitamos el borde rojo aquí porque el error ahora sale en el Alert de arriba,
                                            // pero podemos mantenerlo si es un error específico de archivo.
                                            error && error.includes("document") ? "border-red-300 bg-red-50" : ""
                                        )}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".pdf"
                                            className="hidden"
                                        />

                                        {selectedFile ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm border">
                                                        <FileText className="h-6 w-6 text-red-500" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                                                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={removeFile}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 py-2">
                                                <div className="p-3 bg-gray-100 rounded-full group-hover:bg-primary/10 transition-colors">
                                                    <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Haz clic para subir tu orden de compra</p>
                                                    <p className="text-xs text-gray-400 mt-1">Solo archivos PDF (Máx. 5MB)</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button variant="outline" onClick={() => { setStep('details'); setError(null); setErrorPreview(null) }} disabled={isConvertingQuoteToOrder} className="flex-1 border-gray-300 text-gray-700">
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Volver
                                    </Button>

                                    {previewData?.canProceed && (
                                        <Button
                                            onClick={onConfirmOrder}
                                            disabled={isConvertingQuoteToOrder}
                                            className="flex-[2] bg-primary hover:bg-primary/90 text-white shadow-lg"
                                        >
                                            {isConvertingQuoteToOrder ? <Clock className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                            {isConvertingQuoteToOrder ? 'Procesando...' : 'Confirmar Pedido'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <IncompleteProfileDialog
                open={showIncompleteProfileDialog}
                onOpenChange={setShowIncompleteProfileDialog}
            />
        </>
    );
};