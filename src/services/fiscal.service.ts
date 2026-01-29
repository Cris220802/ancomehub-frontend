import api from '../api/axios';
import {
    FiscalDocumentDetail,
    FiscalFilterDto,
    PaginatedFiscalResponse,
    UpdateFiscalStatusDto,
    UploadExternalInvoiceDto,
    UploadInternalInvoiceDto,
    UploadRepDto,
    FiscalStatus // Just in case passing status directly or wrapped in DTO
} from '../types/fiscal';

export const FiscalService = {
    uploadInternal: async (data: UploadInternalInvoiceDto): Promise<void> => {
        const formData = new FormData();
        formData.append('orderId', data.orderId);
        formData.append('fiscalUuid', data.fiscalUuid);
        formData.append('amount', data.amount.toString());
        if (data.creditDays) formData.append('creditDays', data.creditDays.toString());
        formData.append('pdf', data.pdf);
        formData.append('xml', data.xml);

        await api.post('/fiscal/invoice/internal', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    uploadExternal: async (data: UploadExternalInvoiceDto): Promise<void> => {
        const formData = new FormData();
        formData.append('clientId', data.clientId);
        formData.append('fiscalUuid', data.fiscalUuid);
        formData.append('amount', data.amount.toString());
        if (data.creditDays) formData.append('creditDays', data.creditDays.toString());
        if (data.description) formData.append('description', data.description);
        formData.append('pdf', data.pdf);
        formData.append('xml', data.xml);

        await api.post('/fiscal/invoice/external', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    uploadComplement: async (parentId: string, data: UploadRepDto): Promise<void> => {
        const formData = new FormData();
        formData.append('fiscalUuid', data.fiscalUuid);
        formData.append('amount', data.amount.toString());
        formData.append('pdf', data.pdf);
        formData.append('xml', data.xml);

        await api.post(`/fiscal/invoice/${parentId}/complement`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    findAll: async (filters?: FiscalFilterDto): Promise<PaginatedFiscalResponse> => {
        // Assuming backend returns standard paginated response even if Swagger says generic 200
        // If it returns generic 200 description "", we assume standard structure or adjust if needed.
        const response = await api.get<PaginatedFiscalResponse>('/fiscal', { params: filters });
        return response.data;
    },

    findOne: async (id: string): Promise<FiscalDocumentDetail> => {
        const response = await api.get<FiscalDocumentDetail>(`/fiscal/${id}`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/fiscal/${id}`);
    },

    updateStatus: async (id: string, status: FiscalStatus): Promise<void> => {
        const data: UpdateFiscalStatusDto = { status };
        await api.patch(`/fiscal/${id}/status`, data);
    },
};
