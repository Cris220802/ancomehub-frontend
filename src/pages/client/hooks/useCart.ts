import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CartService } from '../../../services/cart.service';
import { Cart, CartItem } from '../../../types/cart';
import { toast } from 'sonner';

// --- UI Store ---
interface CartUIState {
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

export const useCartUIStore = create<CartUIState>((set) => ({
    isOpen: false,
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));

// --- Logic Hook ---
export const useCart = () => {
    const queryClient = useQueryClient();
    const { openCart } = useCartUIStore();

    const cartQuery = useQuery({
        queryKey: ['cart'],
        queryFn: CartService.getCart,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const addToCartMutation = useMutation({
        mutationFn: CartService.addItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success("Producto agregado al carrito");
            openCart(); // Auto-open cart on add
        },
        onError: () => {
            toast.error("Error al agregar al carrito");
        }
    });

    const updateQuantityMutation = useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
            CartService.updateItemQuantity(itemId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: () => {
            toast.error("Error al actualizar cantidad");
        }
    });

    const removeFromCartMutation = useMutation({
        mutationFn: CartService.removeItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success("Producto eliminado");
        },
        onError: () => {
            toast.error("Error al eliminar del carrito");
        }
    });

    const clearCartMutation = useMutation({
        mutationFn: CartService.clearCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success("Carrito vaciado");
        }
    });

    // Helper to calculate totals
    const cart = cartQuery.data;
    const subtotal = cart?.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0) || 0;
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

    // Logic wrapper for Delta updates
    const setQuantity = (itemId: string, currentQty: number, newQty: number) => {
        if (newQty < 1) return;
        const delta = newQty - currentQty;
        if (delta !== 0) {
            updateQuantityMutation.mutate({ itemId, quantity: delta });
        }
    };

    return {
        cart,
        isLoading: cartQuery.isLoading,
        isError: cartQuery.isError,
        subtotal,
        tax,
        total,
        totalItems,
        addToCart: addToCartMutation.mutate,
        removeFromCart: removeFromCartMutation.mutate,
        clearCart: clearCartMutation.mutate,
        setQuantity, // Exposed safe wrapper
        isUpdating: updateQuantityMutation.isPending || addToCartMutation.isPending || removeFromCartMutation.isPending
    };
};
