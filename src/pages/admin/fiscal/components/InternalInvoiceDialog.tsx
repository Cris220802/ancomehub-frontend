import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAdminFiscal } from '../../hooks/useAdminFiscal';
import { Loader2, Upload } from 'lucide-react';

const formSchema = z.object({
    fiscalUuid: z.string().min(1, 'El Folio Fiscal (UUID) es requerido'),
    amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
    creditDays: z.coerce.number().optional(),
    pdf: z.any(),
    xml: z.any(),
}).refine((data) => data.pdf instanceof File, {
    message: 'El archivo PDF es requerido',
    path: ['pdf'],
}).refine((data) => data.xml instanceof File, {
    message: 'El archivo XML es requerido',
    path: ['xml'],
});

interface InternalInvoiceDialogProps {
    orderId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const InternalInvoiceDialog = ({ orderId, open, onOpenChange }: InternalInvoiceDialogProps) => {
    const { useUploadInternal } = useAdminFiscal();
    const uploadMutation = useUploadInternal();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fiscalUuid: '',
            amount: 0,
            creditDays: 0,
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        uploadMutation.mutate({
            orderId,
            ...values,
        }, {
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Vincular Factura Interna</DialogTitle>
                    <DialogDescription>
                        Sube los archivos y detalles de la factura para vincularla a la orden.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="fiscalUuid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Folio de Factura</FormLabel>
                                    <FormControl>
                                        <Input placeholder="AN0000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto Total</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="creditDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Días de Crédito</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pdf"
                                render={({ field: { value, onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Archivo PDF</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) onChange(file);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="xml"
                                render={({ field: { value, onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Archivo XML</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="file"
                                                accept=".xml"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) onChange(file);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={uploadMutation.isPending}>
                                {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Vincular Factura
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
