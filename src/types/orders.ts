import { Address } from "./users";

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PARTIALLY_DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'CONVERTED';
export type QuoteStatus = 'PENDING' | 'CONVERTED';
export type PaymentMethod = 'CASH_PAYMENT' | 'CREDIT_PAYMENT';
export type OrderType = 'ORDER' | 'QUOTE';
export type OrderPaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface UserSummaryDto {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
}

export interface OrderItemSummaryDto {
    id: string;
    quantity: number;
    unitPriceSnapshot: number;
    productName?: string;
    quantityAllocated?: number;
    quantityPending?: number;
    quantityDelivered?: number;
}

export interface OrderItemDetailDto extends OrderItemSummaryDto {
    productId: string;
    sku: string;
    imageUrl: string;
}

export interface Order {
    id: string;
    folio: string;
    type: OrderType;
    status: OrderStatus;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    paymentMethod: PaymentMethod;
    paymentStatus: OrderPaymentStatus;
    createdAt: string;
    deliveryDate: string | null;
    requiresInvoice: boolean;
    purchaseOrderUrl: string | null;
    cancellationReason: string | null;
    user: UserSummaryDto;
    items: OrderItemSummaryDto[];
}

export interface Quote {
    id: string;
    folio: string;
    type: OrderType;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    validUntil: string | null;
    user: UserSummaryDto;
    items: OrderItemSummaryDto[];
}

export interface OrderDetail extends Order {
    shippingInfo: any;
    validUntil: string | null;
    items: OrderItemDetailDto[];
    fiscalDocuments?: any[];
}

export interface QuoteDetail extends Quote {
    items: OrderItemDetailDto[];
}

export interface CreateOrderDto {
    paymentMethod: PaymentMethod;
    requiresInvoice: boolean;
    file?: File;
    shippingInfo: Address;
}

export interface CreateQuoteDto {
    paymentMethod?: PaymentMethod;
    requiresInvoice?: boolean;
    purchaseOrderUrl?: string;
    validUntil?: string;
}

export interface OrderPreviewResponse {
    items: {
        productId: string;
        name: string;
        imageUrl: string;
        requested: number;
        allocated: number;
        pending: number;
        leadTimeDays: number;
        status: string;
        error: string | null;
    }[];
    hasBackorders: boolean;
    canProceed: boolean;
}

export interface CancelOrderDto {
    reason?: string;
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
}

export interface OrderFilters {
    page?: number;
    limit?: number;
    folio?: string;
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
    dateFrom?: string;
    dateTo?: string;
    validUntilFrom?: string;
    validUntilTo?: string;
}

export interface QuoteFilters {
    page?: number;
    limit?: number;
    folio?: string;
    status?: QuoteStatus;
    dateFrom?: string;
    dateTo?: string;
    validUntilFrom?: string;
    validUntilTo?: string;
}

export interface PaginatedOrdersResponse {
    items: Order[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export interface PaginatedQuotesResponse {
    items: Quote[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export interface RegisterShipmentDto {
    items: ShipmentItemDto[];
}

export interface ShipmentItemDto {
    productId: string;
    quantity: number;
}

export interface responseFulfillBackordersDto {
    success: boolean;
    message: string;
    itemsUpdated: any[];
}