import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
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
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/users";

const addressSchema = z.object({
    street: z.string().min(1, "La calle es requerida"),
    exteriorNumber: z.string().min(1, "El número exterior es requerido"),
    interiorNumber: z.string().optional(),
    neighborhood: z.string().min(1, "La colonia es requerida"),
    city: z.string().min(1, "La ciudad es requerida"),
    state: z.string().min(1, "El estado es requerido"),
    zipCode: z
        .string()
        .length(5, "El código postal debe tener 5 dígitos")
        .regex(/^\d+$/, "El código postal debe contener solo números"),
    country: z.string().optional().default("México"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Address) => void;
    initialData?: Address | null;
    title: string;
}

export function AddressFormDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    title,
}: AddressFormDialogProps) {
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema) as any,
        defaultValues: {
            street: "",
            exteriorNumber: "",
            interiorNumber: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
            country: "México",
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    street: initialData.street || "",
                    exteriorNumber: initialData.exteriorNumber || "",
                    interiorNumber: initialData.interiorNumber || "",
                    neighborhood: initialData.neighborhood || "",
                    city: initialData.city || "",
                    state: initialData.state || "",
                    zipCode: initialData.zipCode || "",
                    country: initialData.country || "México",
                });
            } else {
                form.reset({
                    street: "",
                    exteriorNumber: "",
                    interiorNumber: "",
                    neighborhood: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "México",
                });
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = (data: AddressFormValues) => {
        onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="street"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Calle</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Av. Principal" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="exteriorNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>No. Exterior</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="interiorNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>No. Interior (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Apt 4B" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="neighborhood"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Colonia</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Centro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ciudad</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ciudad de México" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CDMX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código Postal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="06000" maxLength={5} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
