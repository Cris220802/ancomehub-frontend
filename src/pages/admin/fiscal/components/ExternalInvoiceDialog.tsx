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
import { Textarea } from '@/components/ui/textarea';
import { useAdminFiscal } from '../../hooks/useAdminFiscal';
import { Loader2, Search, User, CheckCircle2 } from 'lucide-react';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

// --- Form Schemas ---

const step1Schema = z.object({
    search: z.string().optional(),
});

const step2Schema = z.object({
    clientId: z.string().min(1, 'El cliente es requerido'),
    fiscalUuid: z.string().min(1, 'El Folio Fiscal (UUID) es requerido'),
    amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
    creditDays: z.coerce.number().optional(),
    description: z.string().optional(),
    pdf: z.instanceof(File, { message: 'El archivo PDF es requerido' }),
    xml: z.instanceof(File, { message: 'El archivo XML es requerido' }),
});

interface ExternalInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ExternalInvoiceDialog = ({ open, onOpenChange }: ExternalInvoiceDialogProps) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedClient, setSelectedClient] = useState<any>(null); // Type safe if imported User type
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { useClientsSearch, useUploadExternal } = useAdminFiscal();
    const { data: clientsData, isLoading: loadingClients } = useClientsSearch(
        { search: debouncedSearch, page, limit: 10 },
        // Only fetch when modal is open and in step 1 and search term has length
        open && step === 1
    );

    const uploadMutation = useUploadExternal();

    const form = useForm<z.input<typeof step2Schema>, any, z.output<typeof step2Schema>>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            clientId: '',
            fiscalUuid: '',
            amount: 0,
            creditDays: 0,
            description: '',
        },
    });

    const handleSelectClient = (client: any) => {
        setSelectedClient(client);
        form.setValue('clientId', client.id);
        setStep(2);
    };

    const onSubmit = (values: z.infer<typeof step2Schema>) => {
        uploadMutation.mutate(values, {
            onSuccess: () => {
                form.reset();
                setStep(1);
                setSelectedClient(null);
                setSearchTerm('');
                onOpenChange(false);
            }
        });
    };

    const handleBack = () => {
        setStep(1);
    };

    const resetDialog = (open: boolean) => {
        if (!open) {
            setStep(1);
            setSelectedClient(null);
            setSearchTerm('');
            form.reset();
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={open} onOpenChange={resetDialog}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader className="flex-none">
                    <DialogTitle>Nueva Factura Externa</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? 'Selecciona el cliente asociado a la factura.' : 'Completa los datos fiscales.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0 py-4">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nombre o empresa..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                {loadingClients ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>
                                ) : (clientsData?.items?.length || 0) > 0 ? (
                                    <div className="grid gap-2">
                                        {clientsData?.items.map((client: any) => (
                                            <div
                                                key={client.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleSelectClient(client)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {client.fullName?.[0] || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{client.fullName}</p>
                                                        <p className="text-xs text-gray-500">{client.companyName || 'Sin empresa'}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 text-sm py-4">
                                        {searchTerm ? 'No se encontraron clientes.' : 'Empieza a escribir para buscar.'}
                                    </p>
                                )}
                            </div>

                            {/* Pagination Controls */}
                            {clientsData?.meta && (
                                <CustomPagination
                                    meta={clientsData.meta}
                                    onPageChange={setPage}
                                    isLoading={loadingClients}
                                />
                            )}
                        </div>
                    ) : (
                        <Form {...form}>
                            <form id="external-invoice-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Selected Client Card */}
                                {selectedClient && (
                                    <Card className="p-3 bg-gray-50 border-primary/20 flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                                            {selectedClient.fullName?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{selectedClient.fullName}</p>
                                            <p className="text-xs text-gray-500">{selectedClient.email}</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={handleBack} className="text-xs h-7">
                                            Cambiar
                                        </Button>
                                    </Card>
                                )}

                                <FormField
                                    control={form.control}
                                    name="fiscalUuid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Folio de la Factura</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción / Notas</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Detalles adicionales..." {...field} />
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
                            </form>
                        </Form>
                    )}
                </div>

                <DialogFooter className="flex-none pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => resetDialog(false)}>
                        Cancelar
                    </Button>
                    {step === 2 && (
                        <Button type="submit" form="external-invoice-form" disabled={uploadMutation.isPending}>
                            {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Factura
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
