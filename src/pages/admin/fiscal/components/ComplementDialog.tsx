import { useForm, SubmitHandler } from 'react-hook-form';
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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    fiscalUuid: z.string().min(1, 'El Folio Fiscal (UUID) es requerido'),
    amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
    pdf: z.instanceof(File, { message: 'El archivo PDF es requerido' }),
    xml: z.instanceof(File, { message: 'El archivo XML es requerido' }),
});

type FormValues = z.infer<typeof formSchema>;

interface ComplementDialogProps {
    parentId: string; // ID of the invoice being paid
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ComplementDialog = ({ parentId, open, onOpenChange }: ComplementDialogProps) => {
    const { useUploadComplement } = useAdminFiscal();
    const uploadMutation = useUploadComplement();

    const form = useForm<z.input<typeof formSchema>, any, z.output<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fiscalUuid: '',
            amount: 0,
        },
    });

    const onSubmit: SubmitHandler<FormValues> = (values) => {
        uploadMutation.mutate({
            parentId,
            data: values,
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
                    <DialogTitle>Subir Complemento de Pago (REP)</DialogTitle>
                    <DialogDescription>
                        Sube los archivos del Recibo Electrónico de Pago.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="fiscalUuid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Folio Fiscal (UUID)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto del Pago</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} value={field.value as number} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                Subir Complemento
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
