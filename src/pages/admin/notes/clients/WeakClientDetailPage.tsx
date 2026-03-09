import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdminWeakClient } from "@/pages/admin/hooks/useAdminWeakClient";
import { statementColumns } from "./components/statementColumns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, User, Mail, Phone } from "lucide-react";
import { NoteService } from "@/services/note.service"; // needed for manual download action
import { toast } from "sonner";

export const WeakClientDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [isDownloading, setIsDownloading] = useState(false);

    // Hooks
    const { useWeakClientDetail, useAccountStatement } = useAdminWeakClient();

    // Queries
    const { data: client, isLoading: loadingClient } = useWeakClientDetail(id || '');
    const { data: statement, isLoading: loadingStatement } = useAccountStatement(id || '');
    console.log(client);
    console.log(statement);
    const handleExportExcel = async () => {
        if (!id || !client) return;
        try {
            setIsDownloading(true);
            await NoteService.exportAccountStatementExcel(id, client.name);
            toast.success("Estado de cuenta descargado exitosamente");
        } catch (error) {
            toast.error("Error al descargar el estado de cuenta");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loadingClient || loadingStatement) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!client || !statement) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <h2 className="text-xl font-semibold text-gray-900">Cliente no encontrado</h2>
                <Link to="/admin/notes/clients">
                    <Button variant="link">Volver al directorio</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Top Bar Navigation */}
            <div className="bg-white border-b px-6 py-4 sticky top-0 z-10 w-full">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/notes/clients">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-gray-900">Estado de Cuenta</h1>
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                {client.name}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExportExcel}
                            disabled={isDownloading || statement?.activeNotes?.length === 0}
                        >
                            {isDownloading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Exportar Excel
                        </Button>
                    </div>
                </div>
            </div>

            <main className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* LEFT COLUMN: Client Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <User className="h-4 w-4" /> Información del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500">Nombre / Razón Social</p>
                                    <p className="font-medium text-gray-900">{client.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> Correo Electrónico</p>
                                    <p className="font-medium text-sm text-gray-900 break-all">{client.email || 'No disponible'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</p>
                                    <p className="font-medium text-sm text-gray-900">{client.phone || 'No disponible'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-l-4 border-l-red-500">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold text-gray-500 uppercase">
                                    Resumen de Deuda
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">

                                <div>
                                    <p className="text-xs text-gray-500">Saldo Total Pendiente</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(statement?.summary?.pendingBalance || 0)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <p className="text-xs text-gray-500">Deuda Histórica</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(statement?.summary?.historicalDebt || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Pagado</p>
                                        <p className="text-sm font-semibold text-green-600">
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(statement?.summary?.totalPaid || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Account Statement Table */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base font-bold">
                                    Historial de Notas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <DataTable columns={statementColumns} data={statement?.activeNotes || []} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};
