import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart, useCartUIStore } from '@/pages/client/hooks/useCart';
import { getImageUrl } from '@/lib/utils';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetDescription,
} from '@/components/ui/sheet';

export const CartSheet = () => {
    const {
        cart,
        totalItems,
        subtotal,
        tax,
        total,
        removeFromCart,
        setQuantity,
        isLoading
    } = useCart();

    const { isOpen, closeCart } = useCartUIStore();

    return (
        <Sheet open={isOpen} onOpenChange={closeCart}>
            <SheetContent className="sm:max-w-md w-full flex flex-col h-full bg-white shadow-xl">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Tu Pedido ({totalItems} ítems)
                    </SheetTitle>
                    <SheetDescription>
                        Revisa los productos antes de solicitar tu cotización.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    {isLoading ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">Cargando carrito...</div>
                    ) : cart?.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                            <div className="bg-gray-100 p-4 rounded-full">
                                <ShoppingBag className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-gray-900">Tu carrito está vacío</p>
                                <p className="text-sm text-gray-500">Agrega productos del catálogo para comenzar.</p>
                            </div>
                            <Link to="/" onClick={closeCart}>
                                <Button variant="outline" className="mt-2">
                                    Ir al Catálogo
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {cart?.items.map((item) => (
                                <div key={item.id} className="py-4 flex gap-4">
                                    {/* Image */}
                                    <div className="h-20 w-20 shrink-0 bg-gray-50 border border-gray-100 rounded-md overflow-hidden">
                                        <img
                                            src={getImageUrl(item.product.imageUrl)}
                                            alt={item.product.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{item.product.name}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">SKU: {item.product.sku}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-gray-200 rounded-md h-8">
                                                <button
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                                    onClick={() => setQuantity(item.id, item.quantity, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <Input
                                                    type="number"
                                                    className="w-10 h-full border-0 text-center p-0 text-xs focus-visible:ring-0"
                                                    value={item.quantity}
                                                    onChange={(e) => setQuantity(item.id, item.quantity, parseInt(e.target.value) || 1)}
                                                />
                                                <button
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                                    onClick={() => setQuantity(item.id, item.quantity, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">
                                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPrice * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {cart && cart.items.length > 0 && (
                    <div className="border-t bg-gray-50/50 p-6 space-y-4">
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>IVA (16%)</span>
                                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(tax)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total)}</span>
                            </div>
                        </div>

                        <SheetFooter>
                            <Link to="/cart" className="w-full" onClick={closeCart}>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base shadow-sm">
                                    Ver Carrito Completo
                                </Button>
                            </Link>
                        </SheetFooter>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
