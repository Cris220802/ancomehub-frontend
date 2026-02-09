import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminClients } from '../../hooks/useAdminClients';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Building,
    Mail,
    Phone,
    MapPin,
    User,
    CreditCard,
    History,
    Wallet,
    Briefcase,
    ShoppingBag
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Asegúrate de tener esta utilidad
import { ClientOrdersTable } from './components/ClientOrdersTable';
import { ClientQuotesTable } from './components/ClientQuotesTable';
import { useState } from 'react';
import { EditClientDialog } from './EditClientDialog';
import { updateClientDataDto } from '@/types/users';

// Utility to format address safely
const formatAddress = (address: any) => {
    if (!address) return 'No registrada';
    // Asumiendo que shippingAddresses puede ser un objeto o array, adaptamos:
    const target = Array.isArray(address) ? address[0] : address;
    if (!target) return 'No registrada';

    const parts = [
        target.street,
        target.exteriorNumber ? `#${target.exteriorNumber}` : '',
        target.neighborhood,
        target.city,
        target.state,
        target.zipCode ? `CP ${target.zipCode}` : ''
    ].filter(Boolean);
    return parts.join(', ');
};

export default function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { useGetClientDetail, useManageCredit, useUpdateClientData } = useAdminClients();

    const { data: client, isLoading, error } = useGetClientDetail(id!);
    const creditMutation = useManageCredit();
    const updateClientMutation = useUpdateClientData();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleUpdateClient = (data: updateClientDataDto) => {
        if (!client) return;
        updateClientMutation.mutate(
            { id: client.id, dto: data },
            {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl md:col-span-2" />
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Cliente no encontrado</h2>
                <Button onClick={() => navigate('/admin/clients')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado
                </Button>
            </div>
        );
    }

    const { clientProfile, auditLogs } = client;

    const handleCreditToggle = (enabled: boolean) => {
        creditMutation.mutate({
            userId: client.id,
            creditEnabled: enabled
        });
    };

    // Cálculos de crédito
    const creditLimit = clientProfile.creditLimit || 0;
    const creditUsed = clientProfile.currentCreditUsed || 0;
    const creditAvailable = creditLimit - creditUsed;
    const creditPercentage = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clients')} className="mt-1">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                {client.fullName?.charAt(0).toUpperCase() || 'C'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{client.fullName || 'Cliente sin nombre'}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                    <Building className="h-3.5 w-3.5" />
                                    {clientProfile.companyName || 'Sin Razón Social'}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {client.email}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    {client.phoneNumber || 'Sin número de teléfono'}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="flex items-center gap-1">
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    Requiere orden de compra para hacer pedidos: {client.requiresOrderPurchase ? 'Sí' : 'No'}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs px-2">
                                    {client.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                    Editar Información Fiscal
                </Button>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                        Información General
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                        Pedidos
                    </TabsTrigger>
                    <TabsTrigger value="quotes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                        Cotizaciones
                    </TabsTrigger>
                    <TabsTrigger value="credit" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                        Finanzas y Crédito
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                        Actividad
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: OVERVIEW --- */}
                <TabsContent value="overview">
                    <div className="grid gap-6 md:grid-cols-3">

                        {/* Tarjeta: Detalles Comerciales */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-gray-500" /> Perfil Comercial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">RFC / Tax ID</p>
                                    <p className="text-sm font-medium">{clientProfile.taxId || 'No registrado'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Agente Asignado</p>
                                    {clientProfile.assignedAgent ? (
                                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {clientProfile.assignedAgent.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{clientProfile.assignedAgent.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{clientProfile.assignedAgent.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-yellow-600 italic flex items-center gap-1">
                                            <User className="h-3 w-3" /> Sin agente asignado
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tarjeta: Direcciones */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" /> Direcciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">Facturación</Badge>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {formatAddress(clientProfile.billingAddress)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">Envío Principal</Badge>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {formatAddress(clientProfile.shippingAddresses)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- TAB: ORDERS --- */}
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-gray-500" /> Historial de Pedidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ClientOrdersTable clientId={client.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB: QUOTES --- */}
                <TabsContent value="quotes">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="h-4 w-4 text-gray-500" /> Historial de Cotizaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ClientQuotesTable clientId={client.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB: CREDIT --- */}
                <TabsContent value="credit">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Configuración */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Configuración</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Habilitar Crédito</Label>
                                        <p className="text-xs text-muted-foreground">Permite compras a crédito</p>
                                    </div>
                                    <Switch
                                        checked={clientProfile.creditEnabled || false}
                                        onCheckedChange={handleCreditToggle}
                                        disabled={creditMutation.isPending}
                                    />
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Términos de Pago</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold">{clientProfile.creditDays || 0}</span>
                                        <span className="text-sm text-muted-foreground">días</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Estado Financiero Visual */}
                        {/* <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-gray-500" /> Estado de Cuenta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase">Límite Total</p>
                                        <p className="text-xl font-bold">{formatCurrency(creditLimit)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase text-red-600">Utilizado</p>
                                        <p className="text-xl font-bold text-red-600">{formatCurrency(creditUsed)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase text-green-600">Disponible</p>
                                        <p className="text-xl font-bold text-green-600">{formatCurrency(creditAvailable)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Uso de Crédito</span>
                                        <span>{creditPercentage.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={creditPercentage} className="h-2" />
                                </div>
                            </CardContent>
                        </Card> */}
                    </div>
                </TabsContent>

                {/* --- TAB: ACTIVITY --- */}
                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="h-4 w-4 text-gray-500" /> Historial de Cambios
                            </CardTitle>
                            <CardDescription>Registro de auditoría de la cuenta.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {auditLogs && auditLogs.length > 0 ? (
                                <div className="space-y-4">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{log.action}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </p>
                                                {log.metadata && (
                                                    <pre className="text-[10px] bg-slate-50 p-2 rounded mt-1 overflow-x-auto">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No hay actividad registrada recientemente.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {client && (
                <EditClientDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    initialData={client}
                    onSubmit={handleUpdateClient}
                    isLoading={updateClientMutation.isPending}
                />
            )}
        </div>
    );
}