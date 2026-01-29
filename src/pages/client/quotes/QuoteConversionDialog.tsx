import React, { useState } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// UI Components
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
    Building2,
    Wallet,
    FileText,
    CreditCard,
    MapPin,
    Plus,
    ArrowRight,
    AlertCircle
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
    CASH: { label: 'Efectivo', icon: Banknote, description: 'Contra entrega' },
    TRANSFER: { label: 'Transferencia', icon: Building2, description: 'SPEI / Banco' },
    CREDIT: { label: 'Crédito Ancome', icon: Wallet, description: 'Línea de crédito' },
    CHECK: { label: 'Cheque', icon: FileText, description: 'Salvo buen cobro' },
    DEPOSIT: { label: 'Depósito', icon: CreditCard, description: 'Ventanilla' },
};

const formSchema = z.object({
    paymentMethod: z.enum(['CASH', 'TRANSFER', 'CREDIT', 'CHECK', 'DEPOSIT'] as const, {
        message: "Selecciona un método de pago.",
    }),
    requiresInvoice: z.boolean(),
    shippingAddressIndex: z.string().min(1, {
        message: "Debes seleccionar una dirección de entrega.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export const QuoteConversionDialog = ({ quote, children }: QuoteConversionDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'details' | 'preview'>('details');
    const [previewData, setPreviewData] = useState<OrderPreviewResponse | null>(null);

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
            requiresInvoice: quote.requiresInvoice || false,
            // Pre-select payment method if available in quote, otherwise null (zod handles validation)
            paymentMethod: quote.paymentMethod as PaymentMethod || undefined
        },
    });

    const resetState = () => {
        setStep('details');
        setPreviewData(null);
        form.reset({
            requiresInvoice: quote.requiresInvoice || false,
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

    const onDetailsSubmit = async () => {
        try {
            const data = await previewQuoteToOrder(quote.id);
            setPreviewData(data);
            setStep('preview');
        } catch (error) {
            console.error(error);
            // Toast handled in hook
        }
    };

    const onDetailsErrors = (errors: FieldErrors<FormValues>) => {
        if (errors.shippingAddressIndex) {
            toast.error("Debes seleccionar una dirección de entrega.");
        } else if (errors.paymentMethod) {
            toast.error("Selecciona un método de pago.");
        }
    };

    const onConfirmOrder = async () => {
        try {
            const shippingIndex = form.getValues('shippingAddressIndex');
            const selectedAddress = shippingAddresses[parseInt(shippingIndex)];

            await convertQuoteToOrder({
                id: quote.id,
                data: {
                    paymentMethod: form.getValues('paymentMethod'),
                    requiresInvoice: form.getValues('requiresInvoice'),
                    shippingInfo: selectedAddress
                }
            });
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            // Toast handled in hook
        }
    };

    // --- RENDER HELPERS ---

    const ProgressBar = () => (
        <div className="flex items-center gap-2 mb-6">
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
                <p className="text-green-700 text-sm max-w-xs">
                    Todos los productos están listos para envío inmediato.
                </p>
            </div>
            <QuoteSummaryCard />
        </div>
    );

    const renderBackorderPreview = (items: any[]) => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <Alert className="border-orange-200 bg-orange-50/50">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900 font-semibold">Entrega Parcial</AlertTitle>
                <AlertDescription className="text-orange-800 text-xs">
                    Se enviará lo disponible ahora y el resto quedará pendiente.
                </AlertDescription>
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
                <AlertDescription className="text-red-800">
                    No es posible procesar el pedido por falta de stock.
                </AlertDescription>
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
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden rounded-xl">
                    {/* Header */}
                    <div className="bg-gray-50/80 p-6 border-b pb-4">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {step === 'details' ? <CreditCard className="h-5 w-5 text-primary" /> : <RotateCw className="h-5 w-5 text-primary" />}
                                {step === 'details' ? 'Detalles de Compra' : 'Confirmación'}
                            </DialogTitle>
                            <DialogDescription>
                                {step === 'details' ? 'Verifica los datos para convertir tu cotización.' : 'Revisa disponibilidad y confirma.'}
                            </DialogDescription>
                        </DialogHeader>
                        <ProgressBar />
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto max-h-[65vh]">
                        {step === 'details' && (
                            <Form {...form}>
                                <form id="quote-conversion-form" onSubmit={form.handleSubmit(onDetailsSubmit, onDetailsErrors)} className="space-y-8">

                                    {/* DIRECCIONES */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Dirección de Envío</Label>
                                            <Link to="/client/profile" className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                                                <Plus className="h-3 w-3" /> Nueva
                                            </Link>
                                        </div>

                                        {isLoadingAddresses ? (
                                            <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
                                        ) : shippingAddresses.length === 0 ? (
                                            <div className="text-center p-6 border-2 border-dashed rounded-xl bg-gray-50">
                                                <MapPin className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                                <p className="text-sm text-gray-500">No tienes direcciones guardadas.</p>
                                                <Link
                                                    to="/client/profile"
                                                    className={cn(
                                                        buttonVariants({ variant: "link" }), // Wait, buttonVariants might not be imported if I didn't import it. I removed it in valid cleanup. Let me re-check usage.
                                                        "mt-2 h-auto p-0 text-primary"
                                                    )}
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
                                                                <FormLabel className="flex items-start gap-3 rounded-xl border-2 border-transparent bg-gray-50 p-3 hover:bg-gray-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                                                    <div className="mt-1 h-2 w-2 rounded-full bg-gray-300 peer-data-[state=checked]:bg-primary shrink-0 transition-colors" />
                                                                    <div className="space-y-1">
                                                                        <p className="font-semibold text-sm text-gray-900 leading-none">
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
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Método de Pago</Label>
                                        <Separator className="bg-gray-100" />
                                        <FormField
                                            control={form.control}
                                            name="paymentMethod"
                                            render={({ field }) => (
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="grid grid-cols-2 gap-3"
                                                >
                                                    {Object.entries(paymentConfig).map(([key, config]) => {
                                                        const Icon = config.icon;
                                                        return (
                                                            <FormItem key={key}>
                                                                <FormControl>
                                                                    <RadioGroupItem value={key} className="peer sr-only" />
                                                                </FormControl>
                                                                <FormLabel className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-center h-full">
                                                                    <Icon className="h-6 w-6 text-gray-500 peer-data-[state=checked]:text-primary" />
                                                                    <span className="font-semibold text-xs peer-data-[state=checked]:text-primary">{config.label}</span>
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
                                            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm bg-white">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-semibold text-gray-900">¿Requiere Factura?</FormLabel>
                                                    <p className="text-xs text-gray-500">Se usará tu RFC registrado.</p>
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
                                {previewData && !previewData.canProceed && renderErrorPreview(previewData.items.filter((i: any) => i.status === 'ERROR'))}
                                {previewData && previewData.canProceed && previewData.hasBackorders && renderBackorderPreview(previewData.items.filter((i: any) => i.status === 'PARTIAL'))}
                                {previewData && previewData.canProceed && !previewData.hasBackorders && renderSuccessPreview()}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-4 border-t flex items-center justify-between gap-4">
                        {step === 'details' ? (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium uppercase">Total a Pagar</span>
                                    <span className="text-lg font-bold text-gray-900">{formatCurrency(quote.totalAmount)}</span>
                                </div>
                                <Button
                                    type="submit"
                                    form="quote-conversion-form"
                                    disabled={isPreviewingQuoteToOrder}
                                    className="px-8 shadow-sm"
                                >
                                    {isPreviewingQuoteToOrder ? <Clock className="animate-spin h-4 w-4" /> : <>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => setStep('details')} disabled={isConvertingQuoteToOrder} className="text-gray-500 hover:text-gray-900">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Editar
                                </Button>
                                {previewData?.canProceed && (
                                    <Button
                                        onClick={onConfirmOrder}
                                        disabled={isConvertingQuoteToOrder}
                                        className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 px-6"
                                    >
                                        {isConvertingQuoteToOrder ? <Clock className="animate-spin h-4 w-4" /> : 'Confirmar Pedido'}
                                    </Button>
                                )}
                            </>
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
