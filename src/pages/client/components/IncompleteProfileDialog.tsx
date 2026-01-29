import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { UserCog, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IncompleteProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function IncompleteProfileDialog({ open, onOpenChange }: IncompleteProfileDialogProps) {
    const navigate = useNavigate();

    const handleGoToProfile = () => {
        onOpenChange(false);
        navigate('/client/profile');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0">

                {/* Header Visual con Fondo */}
                <div className="bg-orange-50/50 p-6 flex flex-col items-center justify-center border-b border-orange-100/50">
                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 ring-8 ring-orange-50">
                        <UserCog className="h-8 w-8 text-orange-600" />
                    </div>
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-center text-xl font-bold text-gray-900">
                            ¡Estás a un paso!
                        </DialogTitle>
                        <DialogDescription className="text-center max-w-xs mx-auto text-gray-500">
                            Para procesar tus pedidos y generar tus facturas correctamente, necesitamos algunos datos extra.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Cuerpo con Checklist Visual */}
                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText className="h-3 w-3" /> Datos requeridos
                        </h4>
                        <ul className="space-y-2.5">
                            {/* <li className="flex items-start gap-2.5 text-sm text-gray-600">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                <span>Información de contacto (Teléfono)</span>
                            </li> */}
                            <li className="flex items-start gap-2.5 text-sm text-gray-600">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                <span>Dirección de Entrega</span>
                            </li>
                            {/* <li className="flex items-start gap-2.5 text-sm text-gray-600">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                <span>Datos fiscales (RFC/Razón Social)</span>
                            </li> */}
                        </ul>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto text-gray-500 hover:text-gray-900"
                        >
                            Lo haré más tarde
                        </Button>
                        <Button
                            onClick={handleGoToProfile}
                            className="w-full sm:w-1/2 "
                        >
                            Completar Perfil <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}