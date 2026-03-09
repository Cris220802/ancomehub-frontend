import api from '../api/axios';
import {
    CreateNoteDto,
    UpdateNoteDto,
    FilterNoteDto,
    NoteResponseDto,
    PaginatedNotesResponse,
    CreateWeakClientDto,
    UpdateWeakClientDto,
    FilterWeakClientDto,
    WeakClientResponseDto,
    PaginatedWeakClientsResponse,
    CreateWeakPaymentDto,
    UpdateWeakPaymentDto,
    PaginationDto,
    ClientAccountStatementResponse,
} from '../types/note';

export const NoteService = {
    // ------------------------------------------------------------------------
    // Notes
    // ------------------------------------------------------------------------

    createNote: async (data: CreateNoteDto): Promise<NoteResponseDto> => {
        const response = await api.post<NoteResponseDto>('/notes', data);
        return response.data;
    },

    getOverdueNotes: async (params?: PaginationDto): Promise<PaginatedNotesResponse> => {
        const response = await api.get<PaginatedNotesResponse>('/notes/overdue', { params });
        return response.data;
    },

    getMostOverdueClients: async (params?: PaginationDto): Promise<any> => {
        const response = await api.get<any>('/notes/clients/most-overdue', { params });
        return response.data;
    },

    getNotesByClient: async (clientId: string, params?: FilterNoteDto): Promise<PaginatedNotesResponse> => {
        const response = await api.get<PaginatedNotesResponse>(`/notes/client/${clientId}`, { params });
        return response.data;
    },

    findAllNotes: async (params?: FilterNoteDto): Promise<PaginatedNotesResponse> => {
        const response = await api.get<PaginatedNotesResponse>('/notes', { params });
        return response.data;
    },

    findOneNote: async (id: string): Promise<NoteResponseDto> => {
        const response = await api.get<NoteResponseDto>(`/notes/${id}`);
        return response.data;
    },

    updateNote: async (id: string, data: UpdateNoteDto): Promise<NoteResponseDto> => {
        const response = await api.patch<NoteResponseDto>(`/notes/${id}`, data);
        return response.data;
    },

    removeNote: async (id: string): Promise<void> => {
        await api.delete(`/notes/${id}`);
    },

    // ------------------------------------------------------------------------
    // Weak Clients
    // ------------------------------------------------------------------------

    createWeakClient: async (data: CreateWeakClientDto): Promise<WeakClientResponseDto> => {
        const response = await api.post<WeakClientResponseDto>('/weak-clients', data);
        return response.data;
    },

    findAllWeakClients: async (params?: FilterWeakClientDto): Promise<PaginatedWeakClientsResponse> => {
        const response = await api.get<PaginatedWeakClientsResponse>('/weak-clients', { params });
        return response.data;
    },

    exportAccountStatementExcel: async (id: string, clientName: string): Promise<void> => {
        try {
            const response = await api.get(`/weak-clients/${id}/account-statement/export`, {
                responseType: 'blob', // Crítico para descargar archivos binarios
            });

            // Crear una URL temporal para el blob recibido
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Crear un elemento <a> invisible
            const link = document.createElement('a');
            link.href = url;

            // Asignar el nombre del archivo
            const safeClientName = clientName ? clientName.replace(/\s+/g, '_') : 'Unknown';
            link.setAttribute('download', `estado_cuenta_${safeClientName}.xlsx`);

            // Agregar al DOM, hacer click y remover
            document.body.appendChild(link);
            link.click();

            // Limpieza de memoria
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar el Excel:', error);
            throw error; // Re-lanzar para manejar el error en la UI
        }
    },

    getAccountStatement: async (id: string): Promise<ClientAccountStatementResponse | any> => {
        const response = await api.get<ClientAccountStatementResponse | any>(`/weak-clients/${id}/account-statement`);
        return response.data;
    },

    findOneWeakClient: async (id: string): Promise<WeakClientResponseDto> => {
        const response = await api.get<WeakClientResponseDto>(`/weak-clients/${id}`);
        return response.data;
    },

    updateWeakClient: async (id: string, data: UpdateWeakClientDto): Promise<WeakClientResponseDto> => {
        const response = await api.patch<WeakClientResponseDto>(`/weak-clients/${id}`, data);
        return response.data;
    },

    removeWeakClient: async (id: string): Promise<void> => {
        await api.delete(`/weak-clients/${id}`);
    },

    // ------------------------------------------------------------------------
    // Weak Payments
    // ------------------------------------------------------------------------

    createWeakPayment: async (data: CreateWeakPaymentDto): Promise<any> => {
        const response = await api.post<any>('/weak-payments', data);
        return response.data;
    },

    updateWeakPayment: async (id: string, data: UpdateWeakPaymentDto): Promise<any> => {
        const response = await api.patch<any>(`/weak-payments/${id}`, data);
        return response.data;
    },

    removeWeakPayment: async (id: string): Promise<void> => {
        await api.delete(`/weak-payments/${id}`);
    },
};
