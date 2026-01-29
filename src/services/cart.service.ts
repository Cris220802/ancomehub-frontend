import api from '../api/axios';
import { AddToCartDto, Cart, UpdateCartItemDto } from '../types/cart';

export const CartService = {
    getCart: async (): Promise<Cart> => {
        const response = await api.get<Cart>('/cart');
        return response.data;
    },

    addItem: async (data: AddToCartDto): Promise<Cart> => {
        const response = await api.post<Cart>('/cart', data);
        return response.data;
    },

    updateItemQuantity: async (itemId: string, quantity: number): Promise<Cart> => {
        const data: UpdateCartItemDto = { quantity };
        const response = await api.patch<Cart>(`/cart/${itemId}`, data);
        return response.data;
    },

    removeItem: async (itemId: string): Promise<Cart> => {
        const response = await api.delete<Cart>(`/cart/${itemId}`);
        return response.data;
    },

    clearCart: async (): Promise<void> => {
        await api.delete('/cart');
    },
};
