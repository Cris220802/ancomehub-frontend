import { PaymentMethod, UserSummaryDto } from './orders';

export interface OrderSummaryDto {
    id: string;
    folio: string;
    totalAmount: number;
}

export type PaymentStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
export type PaymentMethodPayment = 'CASH' | 'TRANSFER' | 'CREDIT' | 'CHECK' | 'DEPOSIT';

export interface CreatePaymentDto {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    notes?: string;
    file: File;
}

export interface ReviewPaymentDto {
    status: PaymentStatus;
    rejectionReason?: string;
}

export interface Payment {
    id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    notes?: string;
    proofUrl?: string; // Included in response DTO description
    rejectionReason?: string;
    createdAt: string;
    updatedAt?: string;
    order: OrderSummaryDto;
    user: UserSummaryDto;
}

export interface PaymentFilterDto {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    orderId?: string;
    userId?: string;
}

export interface PaginatedPaymentsResponse {
    items: Payment[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export interface PaymentResponseByOrder {
    payments: Payment[];
    total: number;
}

