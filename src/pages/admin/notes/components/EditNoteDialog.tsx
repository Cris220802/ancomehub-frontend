import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { useAdminNotes } from "@/pages/admin/hooks/useAdminNotes";
import { WeakClientSelect } from "./WeakClientSelect";
import { UpdateNoteDto, NoteResponseDto } from "@/types/note";

const editNoteSchema = z.object({
    folio: z.coerce.number().min(1, "El folio es requerido y mayor a 0"),
    date: z.string().min(1, "La fecha es requerida"),
    weakClientId: z.string().min(1, "Debe seleccionar un cliente"),
    creditDays: z.coerce.number().min(0, "Los días de crédito no pueden ser negativos"),
    notes: z.string().optional(),
});

type EditNoteValues = z.infer<typeof editNoteSchema>;

interface EditNoteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    note: NoteResponseDto | null;
}

const getLocalDateString = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const EditNoteDialog = ({ open, onOpenChange, note }: EditNoteDialogProps) => {
    const { useUpdateNote } = useAdminNotes();
    const updateMutation = useUpdateNote();

    const form = useForm<EditNoteValues>({
        resolver: zodResolver(editNoteSchema) as any,
        defaultValues: {
            folio: "" as any,
            date: "",
            weakClientId: "",
            creditDays: 30,
            notes: "",
        },
    });

    useEffect(() => {
        if (open && note) {
            // Re-calculate creditDays based on dueDate and date if it wasn't returned explicitly
            // (assuming backend stores it, but we might only have dueDate y date)
            const date1 = new Date(note.date).getTime();
            const date2 = new Date(note.dueDate).getTime();
            const diffDays = Math.round((date2 - date1) / (1000 * 3600 * 24));

            form.reset({
                folio: note.folio,
                date: getLocalDateString(note.date),
                weakClientId: note.weakClient?.id || "",
                creditDays: diffDays > 0 ? diffDays : 0,
                notes: "", // Si el backend regresara notas de la factura, se pondrían aquí
            });
        }
    }, [open, note, form]);

    const handleSubmit = (values: EditNoteValues) => {
        if (!note) return;

        const payload: UpdateNoteDto = {
            folio: values.folio,
            date: `${values.date}T12:00:00.000Z`,
            weakClientId: values.weakClientId,
            creditDays: values.creditDays,
            notes: values.notes,
        };

        updateMutation.mutate(
            { id: note.id, data: payload },
            {
                onSuccess: () => {
                    onOpenChange(false);
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Nota de Crédito</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles logísticos de la nota #{note?.folio}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="folio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Folio</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Emisión</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="weakClientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente</FormLabel>
                                    <WeakClientSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
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
                                        <Input type="number" placeholder="30" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comentarios de actualización (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Motivo de la edición..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={updateMutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
