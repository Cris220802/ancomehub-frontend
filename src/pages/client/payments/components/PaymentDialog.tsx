import { useState, useEffect } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";
import { usePayments } from "../../hooks/usePayments";
import { UploadCloud, FileText, X } from "lucide-react";
import { PaymentMethodPayment } from "@/types/payments";

// Schema creator function
const createPaymentSchema = (maxAmount: number) => z.object({
    amount: z.coerce.number()
        .min(0.01, "El monto debe ser mayor a 0")
        .max(maxAmount, `El monto no puede exceder el saldo pendiente (${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(maxAmount)})`),
    method: z.enum(['TRANSFER', 'DEPOSIT', 'CHECK', 'CREDIT', 'CASH']),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<ReturnType<typeof createPaymentSchema>>;

interface PaymentDialogProps {
    orderId: string;
    remainingBalance: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const PaymentDialog = ({
    orderId,
    remainingBalance,
    open,
    onOpenChange,
}: PaymentDialogProps) => {
    const { createPayment, isCreatingPayment } = usePayments();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    // Create schema based on remainingBalance
    const paymentSchema = createPaymentSchema(remainingBalance);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema) as unknown as Resolver<PaymentFormValues>,
        defaultValues: {
            amount: remainingBalance,
            notes: "",
            method: "TRANSFER",
        },
    });

    // Reset default amount when remainingBalance changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                amount: remainingBalance,
                notes: "",
                method: "TRANSFER",
            });
            setSelectedFile(null);
            setFileError(null);
        }
    }, [open, remainingBalance, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Basic validation
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setFileError("El archivo no debe pesar más de 5MB");
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setFileError(null);
        }
    };

    const onSubmit: SubmitHandler<PaymentFormValues> = async (values) => {
        if (!selectedFile) {
            setFileError("Debes adjuntar el comprobante de pago");
            return;
        }

        try {
            await createPayment({
                orderId,
                amount: values.amount,
                method: values.method as PaymentMethodPayment,
                notes: values.notes,
                file: selectedFile,
            });
            onOpenChange(false);
        } catch (error) {
            // Toast handled in hook
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reportar Pago</DialogTitle>
                    <DialogDescription>
                        Sube tu comprobante para acelerar la validación.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto Pagado</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="pl-7"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pago</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un método" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="TRANSFER">Transferencia / SPEI</SelectItem>
                                            <SelectItem value="DEPOSIT">Depósito Bancario</SelectItem>
                                            <SelectItem value="CHECK">Cheque</SelectItem>
                                            <SelectItem value="CREDIT">Tarjeta</SelectItem>
                                            <SelectItem value="CASH">Efectivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Referencia, sucursal, etc."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <FormLabel>Comprobante</FormLabel>
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${fileError ? "border-red-300 bg-red-50" : "border-gray-200 hover:bg-gray-50"
                                }`}>
                                <input
                                    type="file"
                                    id="payment-proof"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                />

                                {!selectedFile ? (
                                    <label htmlFor="payment-proof" className="cursor-pointer block">
                                        <UploadCloud className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm font-medium text-gray-700">
                                            Click para subir archivo
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PDF o Imagen (Máx. 5MB)
                                        </p>
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between bg-white p-2 rounded border shadow-sm">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="h-5 w-5 text-primary shrink-0" />
                                            <span className="text-sm text-gray-700 truncate max-w-[180px]">
                                                {selectedFile.name}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                                            onClick={() => setSelectedFile(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {fileError && <p className="text-xs text-red-500 font-medium">{fileError}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isCreatingPayment}>
                                {isCreatingPayment ? "Enviando..." : "Enviar Comprobante"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
