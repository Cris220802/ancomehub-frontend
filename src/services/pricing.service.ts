import api from '../api/axios';
import {
    AssignPriceListDto,
    CreatePriceListDto,
    FilterPriceListDto,
    PaginatedPriceListResponse,
    PriceList,
    PriceListDetail,
    PriceListItem,
    UnassignPriceListDto,
    UpdatePriceListDto,
    UpsertPriceListItemDto,
} from '../types/pricing';

export const PricingService = {
    // Lists
    createList: async (data: CreatePriceListDto): Promise<PriceList> => {
        const response = await api.post<PriceList>('/pricing/lists', data);
        return response.data;
    },

    findOneList: async (id: string): Promise<PriceListDetail> => {
        const response = await api.get<PriceListDetail>(`/pricing/lists/${id}`);
        return response.data;
    },

    findAllLists: async (params?: FilterPriceListDto): Promise<PaginatedPriceListResponse> => {
        const response = await api.get<PaginatedPriceListResponse>('/pricing/lists', { params });
        return response.data;
    },

    updateList: async (id: string, data: UpdatePriceListDto): Promise<PriceListDetail> => {
        const response = await api.patch<PriceListDetail>(`/pricing/lists/${id}`, data);
        return response.data;
    },

    removeList: async (id: string): Promise<void> => {
        await api.delete(`/pricing/lists/${id}`);
    },

    // Items (Rules)
    upsertItem: async (data: UpsertPriceListItemDto): Promise<PriceListItem> => {
        const response = await api.post<PriceListItem>('/pricing/items', data);
        return response.data;
    },

    // Find one item endpoint was requested in prompts earlier but standard CRUD often implies it.
    // Swagger has /pricing/items/{id} for get and delete.
    removeItem: async (id: string): Promise<void> => {
        await api.delete(`/pricing/items/${id}`);
    },

    // Calculation & Assignment
    calculatePrice: async (listId: string, productId: string): Promise<number> => {
        // The endpoint /pricing/calculate/{listId}/{productId} might return an object or just the number.
        // Assuming it returns standard wrapper or just value?
        // User prompt said: "Retorna el precio calculado (number)."
        // Let's assume the response.data contains the number directly or in a DTO.
        // Based on other endpoints it likely returns just 200 OK.
        // If it returns a scalar, axios handles it.
        // If it returns { price: number }, we might need to adjust.
        // For now assuming it returns the number directly or we need to cast.
        const response = await api.get<number>(`/pricing/calculate/${listId}/${productId}`);
        return response.data;
    },

    assignToClients: async (data: AssignPriceListDto): Promise<void> => {
        await api.post('/pricing/assign', data);
    },

    unassignFromClients: async (data: UnassignPriceListDto): Promise<void> => {
        await api.delete(`/pricing/unassign/${data.userId}`);
    },
};
