import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart, useCartUIStore } from '@/pages/client/hooks/useCart';

export const CartTrigger = () => {
    const { totalItems } = useCart();
    const { toggleCart } = useCartUIStore();

    return (
        <Button
            variant="ghost"
            className="relative p-2 hover:bg-gray-100 rounded-lg group"
            onClick={toggleCart}
        >
            <ShoppingBag className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
            <span className="sr-only">Carrito</span>
            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {totalItems}
                </span>
            )}
        </Button>
    );
};
