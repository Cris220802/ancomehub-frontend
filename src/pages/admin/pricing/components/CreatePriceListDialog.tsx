
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/Button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { useAdminPriceLists } from '../../hooks/useAdminPriceLists';

const formSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePriceListDialog() {
    const [open, setOpen] = useState(false);
    const { useCreatePriceList } = useAdminPriceLists();
    const createMutation = useCreatePriceList();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    const onSubmit = (values: FormValues) => {
        createMutation.mutate(values, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Lista
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nueva Lista de Precios</DialogTitle>
                    <DialogDescription>
                        Crea una lista para administrar precios especiales para tus clientes.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Distribuidores VIP" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalles sobre esta lista..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Crear Lista
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
