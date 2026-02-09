export interface AddToCartDto {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemDto {
    quantity: number;
}

export interface CartItem {
    id: string;
    quantity: number;
    // unitPrice: number;
    // priceListId: string | null;
    product: {
        id: string;
        sku: string;
        name: string;
        imageUrl: string;
    };
}

export interface Cart {
    id: string;
    lastActivityAt: string;
    items: CartItem[];
}
