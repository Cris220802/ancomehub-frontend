import api from '../api/axios';
import {
    CreatePaymentDto,
    PaginatedPaymentsResponse,
    Payment,
    PaymentFilterDto,
    PaymentResponseByOrder,
    ReviewPaymentDto,
} from '../types/payments';

export const PaymentsService = {
    create: async (data: CreatePaymentDto): Promise<void> => {
        const formData = new FormData();
        formData.append('orderId', data.orderId);
        formData.append('amount', data.amount.toString());
        formData.append('method', data.method);
        if (data.notes) {
            formData.append('notes', data.notes);
        }
        formData.append('file', data.file);

        await api.post('/payments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    findAll: async (filters?: PaymentFilterDto): Promise<PaginatedPaymentsResponse> => {
        const response = await api.get<PaginatedPaymentsResponse>('/payments', { params: filters });
        return response.data;
    },

    findPaymentsByOrderId: async (orderId: string): Promise<PaymentResponseByOrder> => {
        const response = await api.get<PaymentResponseByOrder>(`/payments/order/${orderId}`);
        return response.data;
    },

    findOne: async (id: string): Promise<Payment> => {
        const response = await api.get<Payment>(`/payments/${id}`);
        return response.data;
    },

    review: async (id: string, data: ReviewPaymentDto): Promise<Payment> => {
        const response = await api.patch<Payment>(`/payments/${id}/review`, data);
        console.log(response.data);
        return response.data;
    },
};
