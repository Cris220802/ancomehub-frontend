
import { useParams, Link } from "react-router-dom";
import { useAdminOrders } from "@/pages/admin/hooks/useAdminOrders";
import { QuoteStatus } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Loader2,
    ArrowLeft,
    Package,
    User,
    Mail,
    Copy,
    Calendar,
    ShoppingCart
} from "lucide-react";
import { getImageUrl, cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const statusConfig: Record<QuoteStatus, { label: string; color: string; }> = {
    PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    CONVERTED: { label: 'Convertida', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export const QuoteAdminDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { useAdminQuote } = useAdminOrders();

    const { data: quote, isLoading } = useAdminQuote(id || '');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Cotización no encontrada</h2>
                <Link to="/admin/orders">
                    <Button variant="link">Volver al listado</Button>
                </Link>
            </div>
        );
    }

    const currentStatus = statusConfig[quote.status as QuoteStatus] || statusConfig.PENDING;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado al portapapeles");
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Top Bar Navigation */}
            <div className="bg-white border-b px-6 py-4 sticky top-0 z-10 w-full">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to={`/admin/clients/${quote.user?.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-gray-900">Cotización {quote.folio}</h1>
                                <Badge variant="outline" className={cn("text-xs font-medium", currentStatus.color)}>
                                    {currentStatus.label}
                                </Badge>
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                {quote.id}
                                <Copy
                                    className="h-3 w-3 cursor-pointer hover:text-gray-900"
                                    onClick={() => copyToClipboard(quote.id)}
                                />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUMNA IZQUIERDA: Detalle Logístico y Productos */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. PRODUCTOS */}
                        <Card className="shadow-sm overflow-hidden border-t-4 border-t-blue-500">
                            <CardHeader className="bg-gray-50/50 border-b py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4 text-gray-500" /> Productos Cotizados
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-white">{quote.items.length} ítems</Badge>
                                </div>
                            </CardHeader>
                            <div className="divide-y divide-gray-100">
                                {quote.items.map((item: any) => (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-gray-50/30 transition-colors">
                                        {/* Imagen y Datos Básicos */}
                                        <div className="h-16 w-16 shrink-0 border rounded bg-white p-1">
                                            <img
                                                src={getImageUrl(item.imageUrl)}
                                                alt={item.productName}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{item.productName || item.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {item.sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block font-bold text-sm">x{item.quantity}</span>
                                                    <p className="text-sm font-semibold text-green-700">
                                                        {formatCurrency(item.unitPriceSnapshot)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* 2. Información del Cliente */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" /> Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                        {quote.user?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{quote.user?.fullName}</p>
                                        <p className="text-[10px] text-gray-500">ID: {quote.user?.id.slice(0, 8)}</p>
                                        <Link to={`/admin/clients/${quote.user?.id}`} className="text-xs text-blue-600 hover:underline">
                                            Ver perfil
                                        </Link>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" /> {quote.user?.email}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUMNA DERECHA: Resumen Financiero */}
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">Resumen de Cotización</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Creación
                                        </span>
                                        <span className="font-medium">
                                            {new Date(quote.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {quote.validUntil && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" /> Válida hasta
                                            </span>
                                            <span className="font-medium text-orange-600">
                                                {new Date(quote.validUntil).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-gray-500">Monto Total</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {formatCurrency(quote.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};
