import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/pages/client/hooks/useCart';
import { useOrders } from '@/pages/client/hooks/useOrders';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PaymentMethodPayment } from '@/types/payments';
import { CartCheckoutDialog } from './CartCheckoutDialog';
import { CreateQuoteDialog } from './components/CreateQuoteDialog';



export const CartPage = () => {
    const {
        cart,
        subtotal,
        tax,
        total,
        removeFromCart,
        setQuantity,
        isLoading,
        totalItems
    } = useCart();

    const { createOrderPreview, createQuote, isCreatingQuote, isCreatingOrderPreview } = useOrders();

    if (isLoading) {
        return <div className="p-8 text-center">Cargando carrito...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                    <ShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Parece que aún no has agregado productos a tu pedido. Explora nuestro catálogo y encuentra lo que necesitas.
                </p>
                <Link to="/">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Catálogo
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Tu Pedido ({totalItems} ítems)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Cart Table - Left Column */}
                <div className="lg:col-span-8 bg-white border rounded-lg shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-[40%]">Producto</TableHead>
                                <TableHead className="text-right">Precio Unitario</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex gap-4 items-center">
                                            <div className="h-16 w-16 bg-gray-100 border rounded-md overflow-hidden shrink-0">
                                                <img
                                                    src={getImageUrl(item.product.imageUrl)}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <div>
                                                <Link to={`/product/${item.product.id}`} className="font-medium text-gray-900 hover:text-primary hover:underline line-clamp-1">
                                                    {item.product.name}
                                                </Link>
                                                <div className="text-xs text-muted-foreground mt-1">SKU: {item.product.sku}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-gray-600">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPrice)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center">
                                            <div className="flex items-center border border-gray-300 rounded-md h-9">
                                                <button
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 text-gray-600"
                                                    onClick={() => setQuantity(item.id, item.quantity, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <Input
                                                    type="number"
                                                    className="w-12 h-full border-0 text-center p-0 focus-visible:ring-0"
                                                    value={item.quantity}
                                                    onChange={(e) => setQuantity(item.id, item.quantity, parseInt(e.target.value) || 1)}
                                                />
                                                <button
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"
                                                    onClick={() => setQuantity(item.id, item.quantity, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-gray-900">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPrice * item.quantity)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Summary Card - Right Column */}
                <div className="lg:col-span-4 bg-white border rounded-lg shadow-sm p-6 space-y-6 sticky top-24">
                    <h3 className="font-semibold text-lg text-gray-900 border-b pb-4">Resumen del Pedido</h3>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>IVA (16%)</span>
                            <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(tax)}</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-gray-900">Total</span>
                        <span className="font-bold text-xl text-primary">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total)}</span>
                    </div>

                    <CreateQuoteDialog
                        onConfirm={() => createQuote({})}
                        isLoading={isCreatingQuote}
                    />

                    <CartCheckoutDialog cartItems={cart.items} />

                    <p className="text-xs text-center text-gray-500 mt-4">
                        * Los precios pueden estar sujetos a cambios. Al crear el pedido, un agente confirmará el pedido.
                    </p>
                </div>

            </div>
        </div>
    );
};
