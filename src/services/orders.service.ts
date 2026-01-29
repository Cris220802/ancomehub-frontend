import api from '../api/axios';
import {
    CancelOrderDto,
    CreateOrderDto,
    CreateQuoteDto,
    OrderDetail,
    OrderFilters,
    OrderPreviewResponse,
    OrderStatus,
    PaginatedOrdersResponse,
    RegisterShipmentDto,
    responseFulfillBackordersDto,
    UpdateOrderStatusDto,
} from '../types/orders';

export const OrdersService = {
    // Orders
    createOrder: async (data: CreateOrderDto): Promise<OrderDetail> => {
        const response = await api.post<OrderDetail>('/orders', data);
        return response.data;
    },

    createPreviewOrder: async (data: CreateOrderDto): Promise<OrderPreviewResponse> => {
        const response = await api.post<OrderPreviewResponse>('/orders/preview', data);
        return response.data;
    },



    findAllOrders: async (filters?: OrderFilters): Promise<PaginatedOrdersResponse> => {
        const response = await api.get<PaginatedOrdersResponse>('/orders', { params: filters });
        return response.data;
    },

    findOne: async (id: string): Promise<OrderDetail> => {
        const response = await api.get<OrderDetail>(`/orders/${id}`);
        return response.data;
    },

    cancel: async (id: string, reason?: string): Promise<void> => {
        const data: CancelOrderDto = { reason };
        await api.post(`/orders/${id}/cancel`, data);
    },

    updateStatus: async (id: string, status: OrderStatus): Promise<void> => {
        const data: UpdateOrderStatusDto = { status };
        const response = await api.patch(`/orders/${id}/status`, data);
        console.log(response.data);
        return response.data;
    },

    confirmOrder: async (id: string): Promise<OrderDetail> => {
        const response = await api.post<OrderDetail>(`/orders/${id}/confirm`);
        return response.data;
    },

    registerShipment: async (id: string, data: RegisterShipmentDto): Promise<OrderDetail> => {
        const response = await api.post<OrderDetail>(`/orders/${id}/shipment`, data);
        return response.data;
    },

    fulfillBackorders: async (id: string): Promise<responseFulfillBackordersDto> => {
        const response = await api.post<responseFulfillBackordersDto>(`/orders/${id}/fulfill-backorders`);
        return response.data;
    },

    findPendingInvoicing: async (page = 1, limit = 5): Promise<PaginatedOrdersResponse> => {
        const response = await api.get<PaginatedOrdersResponse>('/orders/pending-invoicing', {
            params: { page, limit }
        });
        return response.data;
    },

    findOrdersByClient: async (id: string, filters?: OrderFilters): Promise<PaginatedOrdersResponse> => {
        const response = await api.get<PaginatedOrdersResponse>(`/orders/client/${id}`, { params: filters });
        return response.data;
    },

    // Quotes
    createQuote: async (data: CreateQuoteDto): Promise<OrderDetail> => {
        const response = await api.post<OrderDetail>('/orders/quote', data);
        return response.data;
    },

    convertQuoteToOrder: async (data: CreateOrderDto, id: string): Promise<OrderDetail> => {
        const response = await api.post<OrderDetail>(`/orders/quotes/${id}/convert`, data);
        return response.data;
    },

    previewQuoteToOrder: async (id: string): Promise<OrderPreviewResponse> => {
        const response = await api.post<OrderPreviewResponse>(`/orders/quotes/${id}/preview-conversion`);
        return response.data;
    },

    findAllQuotes: async (filters?: OrderFilters): Promise<PaginatedOrdersResponse> => {
        const response = await api.get<PaginatedOrdersResponse>('/orders/quotes', { params: filters });
        return response.data;
    },

    findOneQuote: async (id: string): Promise<OrderDetail> => {
        const response = await api.get<OrderDetail>(`/orders/quotes/${id}`);
        return response.data;
    },

    downloadQuotePdf: async (id: string, folio: string): Promise<void> => {
        try {
            const response = await api.get(`/orders/quotes/${id}/download`, {
                responseType: 'blob', // <--- CRÍTICO: Esto le dice a Axios que es un archivo binario
            });

            // Crear una URL temporal para el blob recibido
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Crear un elemento <a> invisible
            const link = document.createElement('a');
            link.href = url;

            // Asignar el nombre del archivo (puedes usar el folio que pasas como argumento)
            link.setAttribute('download', `Cotizacion-${folio}.pdf`);

            // Agregar al DOM, hacer click y remover
            document.body.appendChild(link);
            link.click();

            // Limpieza de memoria
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error al descargar el PDF:', error);
            throw error; // Re-lanzar para que el componente muestre el toast de error
        }
    },
};
