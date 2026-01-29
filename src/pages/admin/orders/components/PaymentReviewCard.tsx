
import { Payment, ReviewPaymentDto } from '@/types/payments';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, FileText, ExternalLink, Calendar, Banknote } from 'lucide-react';
import { getImageUrl, cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface PaymentReviewCardProps {
    payment: Payment;
    onReview: (data: ReviewPaymentDto & { id: string }) => void;
    isReviewing: boolean;
}

export const PaymentReviewCard = ({ payment, onReview, isReviewing }: PaymentReviewCardProps) => {
    const [rejectReason, setRejectReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const handleApprove = () => {
        onReview({
            id: payment.id,
            status: 'APPROVED'
        });
    };

    const handleReject = () => {
        if (!rejectReason.trim()) return;
        onReview({
            id: payment.id,
            status: 'REJECTED',
            rejectionReason: rejectReason
        });
        setIsRejectDialogOpen(false);
    };

    const proofUrl = payment.proofUrl ? getImageUrl(payment.proofUrl) : null;
    const isPending = payment.status === 'PENDING_REVIEW';

    return (
        <Card className={cn("overflow-hidden transition-all", isPending && "border-yellow-200 shadow-md ring-1 ring-yellow-100")}>
            <CardHeader className="p-4 bg-gray-50/50 border-b flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Badge variant={isPending ? "secondary" : "outline"} className={cn(
                        payment.status === 'APPROVED' && "bg-green-100 text-green-800 border-green-200",
                        payment.status === 'REJECTED' && "bg-red-100 text-red-800 border-red-200",
                        payment.status === 'PENDING_REVIEW' && "bg-yellow-100 text-yellow-800 border-yellow-200"
                    )}>
                        {payment.status === 'PENDING_REVIEW' ? 'Pendiente' :
                            payment.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="font-bold text-lg text-gray-900 flex items-center gap-1">
                    <Banknote className="h-4 w-4 text-gray-400" />
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payment.amount)}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Método</p>
                        <p className="font-medium text-gray-700">{payment.method}</p>
                    </div>
                    {payment.notes && (
                        <div className="col-span-2 bg-gray-50 p-2 rounded text-gray-600 text-xs italic border">
                            "{payment.notes}"
                        </div>
                    )}
                </div>

                {/* Proof Viewer */}
                {proofUrl ? (
                    <div className="border rounded-lg p-2 bg-slate-50 flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 bg-white border rounded flex items-center justify-center text-gray-400">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Comprobante</p>
                            <p className="text-xs text-gray-500 truncate">Click para ver detalle</p>
                        </div>
                        <a
                            href={proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors p-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic text-center p-2 border border-dashed rounded">
                        Sin comprobante adjunto
                    </div>
                )}
            </CardContent>

            {isPending && (
                <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-3">
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                        onClick={handleApprove}
                        disabled={isReviewing}
                    >
                        {isReviewing ? "..." : <><CheckCircle2 className="mr-2 h-4 w-4" /> Aprobar</>}
                    </Button>

                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="w-full" disabled={isReviewing}>
                                <XCircle className="mr-2 h-4 w-4" /> Rechazar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Rechazar Pago</DialogTitle>
                                <DialogDescription>
                                    Indica al cliente la razón por la cual el pago no es válido.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Motivo del rechazo</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Ej. Comprobante ilegible, monto incorrecto..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancelar</Button>
                                <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
                                    Confirmar Rechazo
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}
        </Card>
    );
};
