
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
import { Button } from "@/components/ui/Button";
import { FileText, Clock } from "lucide-react";
import { useState } from "react";

interface CreateQuoteDialogProps {
    onConfirm: () => void;
    isLoading: boolean;
}

export const CreateQuoteDialog = ({ onConfirm, isLoading }: CreateQuoteDialogProps) => {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 h-12 text-lg font-semibold shadow-sm mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 animate-spin" /> Procesando...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Crear Cotización
                        </span>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        Confirmar Cotización
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            Al crear una cotización, los productos de tu carrito se guardarán como una propuesta formal y tu carrito actual se vaciará.
                        </p>
                        <p className="font-medium text-gray-700">
                            ¿Estás seguro de que deseas continuar?
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Prevenimos el cierre automático
                            handleConfirm();
                            setOpen(false);
                        }}
                        className=""
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creando...' : 'Sí, crear cotización'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
