import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAdminNotes } from "@/pages/admin/hooks/useAdminNotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Copy, User, Calendar, CreditCard, PlusCircle, Trash2, Edit, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentDialog } from "./components/PaymentDialog";
import { EditNoteDialog } from "./components/EditNoteDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ON_TIME: 'bg-blue-100 text-blue-800 border-blue-200',
    PARTIALLY_PAID_ON_TIME: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    PARTIALLY_PAID_OVERDUE: 'bg-orange-100 text-orange-800 border-orange-200',
    OVERDUE: 'bg-red-100 text-red-800 border-red-200',
    PAID: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    ON_TIME: 'A Tiempo',
    PARTIALLY_PAID_ON_TIME: 'Abono (A Tiempo)',
    PARTIALLY_PAID_OVERDUE: 'Abono (Vencido)',
    OVERDUE: 'Vencido',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
};

export const NoteDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Hooks
    const {
        useNoteDetail,
        useCreateWeakPayment,
        useUpdateWeakPayment,
        useDeleteWeakPayment,
        useDeleteNote,
    } = useAdminNotes();

    // Queries
    const { data: note, isLoading } = useNoteDetail(id || '');
    console.log(note);
    // Mutations
    const createPaymentMutation = useCreateWeakPayment();
    const updatePaymentMutation = useUpdateWeakPayment();
    const deletePaymentMutation = useDeleteWeakPayment();
    const deleteNoteMutation = useDeleteNote();

    // Dialog state
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null); // null = Create Mode
    const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

    // Note edit/delete state
    const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false);
    const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <h2 className="text-xl font-semibold text-gray-900">Nota no encontrada</h2>
                <Link to="/admin/notes">
                    <Button variant="link">Volver al listado</Button>
                </Link>
            </div>
        );
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado al portapapeles");
    };

    const handleOpenCreatePayment = () => {
        setEditingPayment(null);
        setPaymentDialogOpen(true);
    };

    const handleOpenEditPayment = (payment: any) => {
        setEditingPayment({
            id: payment.id,
            amount: payment.amount,
            // Format for HTML date input YYYY-MM-DD
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
            notes: payment.notes || ''
        });
        setPaymentDialogOpen(true);
    };

    const handleSubmitPayment = (data: any) => {
        if (!id) return;

        if (editingPayment) {
            updatePaymentMutation.mutate({
                id: editingPayment.id,
                noteId: id,
                data: data
            }, {
                onSuccess: () => setPaymentDialogOpen(false)
            });
        } else {
            createPaymentMutation.mutate({ ...data, noteId: id }, {
                onSuccess: () => setPaymentDialogOpen(false)
            });
        }
    };

    const handleConfirmDeletePayment = () => {
        if (!deletingPaymentId || !id) return;
        deletePaymentMutation.mutate({ id: deletingPaymentId, noteId: id }, {
            onSuccess: () => setDeletingPaymentId(null)
        });
    };

    const handleConfirmDeleteNote = () => {
        if (!id) return;
        deleteNoteMutation.mutate(id, {
            onSuccess: () => {
                setDeleteNoteDialogOpen(false);
                navigate('/admin/notes');
            }
        });
    };

    // Calculate Paid / Balance
    // En el backend la estructura de nota puede venir con el array de weakPayments.
    // Confirmar que el backend envie estos los pagos en weakPayments.
    const payments = (note as any).weakPayments || [];
    const paidAmount = payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
    const balance = Math.max(0, note.totalAmount - paidAmount);


    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Top Bar Navigation */}
            <div className="bg-white border-b px-6 py-4 sticky top-0 z-10 w-full">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/notes">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-gray-900">Nota #{note.folio}</h1>
                                <Badge variant="outline" className={cn("text-xs font-medium", statusColors[note.status] || 'bg-gray-100')}>
                                    {statusLabels[note.status] || note.status}
                                </Badge>
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                {note.id}
                                <Copy
                                    className="h-3 w-3 cursor-pointer hover:text-gray-900"
                                    onClick={() => copyToClipboard(note.id)}
                                />
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {note.status !== 'CANCELLED' && (
                            <>
                                <Button variant="outline" onClick={() => setEditNoteDialogOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </Button>
                                <Button variant="destructive" onClick={() => setDeleteNoteDialogOpen(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <main className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Data Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <User className="h-4 w-4" /> Detalles de Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Nombre</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm text-gray-900">{note.weakClient.name}</p>
                                            <Link to={`/admin/notes/clients/${note.weakClient.id}`}>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <ExternalLink className="h-4 w-4 text-blue-600" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium text-sm text-gray-900">{note.weakClient.email || 'No disponible'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Teléfono</p>
                                        <p className="font-medium text-sm text-gray-900">{note.weakClient.phone || 'No disponible'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Fechas y Montos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500">Fecha de Emisión</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(note.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Fecha de Vencimiento</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(note.dueDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                {note.subtotalAmount != null && (
                                    <div className="pt-2 border-t flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-bold text-gray-900">
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(note.subtotalAmount)}
                                        </span>
                                    </div>
                                )}
                                {note.taxAmount != null && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">IVA</span>
                                        <span className="font-bold text-gray-900">
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(note.taxAmount)}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-2 border-t flex justify-between">
                                    <span className="text-gray-600">Total de la nota</span>
                                    <span className="font-bold text-gray-900">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(note.totalAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-600">Total Abonado</span>
                                    <span className="font-bold text-green-700">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(note.paidAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-red-600 font-bold">Saldo Pendiente</span>
                                    <span className="font-bold text-red-600">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(note.pendingAmount)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Payments Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" /> Registro de Abonos
                                </CardTitle>
                                {balance > 0 && note.status !== 'CANCELLED' && (
                                    <Button onClick={handleOpenCreatePayment} size="sm" className="h-8">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Nuevo Abono
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {note.payments.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                        <CreditCard className="h-10 w-10 text-gray-300 mb-2" />
                                        <p>No se han registrado abonos para esta nota.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {note.payments.map((payment: any) => (
                                            <div key={payment.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition-colors gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-lg text-green-700">
                                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payment.amount)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                                                        <p className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(payment.paymentDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                        {payment.notes && (
                                                            <p className="italic">"{payment.notes}"</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 self-end sm:self-center">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenEditPayment(payment)} className="h-8 w-8 p-0">
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => setDeletingPaymentId(payment.id)} className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200">
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Note Delete Dialog */}
            <AlertDialog open={!!deletingPaymentId} onOpenChange={(open) => !open && setDeletingPaymentId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Abono?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el registro del abono y recalculará el saldo de la nota. Esta acción es irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDeletePayment} className="bg-red-600 hover:bg-red-700">
                            Sí, Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Payment Modal */}
            <PaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                onSubmit={handleSubmitPayment}
                isPending={createPaymentMutation.isPending || updatePaymentMutation.isPending}
                initialData={editingPayment}
                title={editingPayment ? "Editar Abono" : "Registrar Nuevo Abono"}
                description={editingPayment ? "Modifica los detalles del abono existente." : "Ingresa los detalles del pago recibido para esta nota."}
            />

            {/* Note Edit Dialog */}
            <EditNoteDialog
                open={editNoteDialogOpen}
                onOpenChange={setEditNoteDialogOpen}
                note={note}
            />

            {/* Note Delete Confirm Dialog */}
            <AlertDialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Nota de Crédito?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la nota de crédito y todos sus abonos asociados. Esta acción es irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteNoteMutation.isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeleteNote}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteNoteMutation.isPending}
                        >
                            {deleteNoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Sí, Eliminar Nota
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
