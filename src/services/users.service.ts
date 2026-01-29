import api from '../api/axios';
import {
    Address,
    AgentCatalogResponseDto,
    AgentResponseDto,
    AgentsFilterDto,
    AssignAgentDto,
    AssignClientCreditDto,
    ClientDetailResponseDto,
    ClientsFilterDto,
    CompleteRegistrationDto,
    CreateUserDto,
    InviteUserDto,
    PaginatedAgentsResponseDto,
    PaginatedClientsResponseDto,
    UpdateClientProfileDto,
    UpdateUserDto,
} from '../types/users';

export const UsersService = {
    create: async (dto: CreateUserDto): Promise<void> => {
        await api.post('/users', dto);
    },

    update: async (id: string, dto: UpdateUserDto): Promise<void> => {
        await api.patch(`/users/${id}`, dto);
    },

    invite: async (dto: InviteUserDto): Promise<void> => {
        await api.post('/users/invite', dto);
    },

    beforeInvite: async (dto: InviteUserDto): Promise<void> => {
        await api.post('/users/before-invite', dto);
    },

    completeRegistration: async (dto: CompleteRegistrationDto): Promise<void> => {
        await api.post('/users/complete-registration', dto);
    },

    findAllClients: async (params?: ClientsFilterDto): Promise<PaginatedClientsResponseDto> => {
        const response = await api.get('/users/clients', { params });
        return response.data;
    },

    findOneClient: async (id: string): Promise<ClientDetailResponseDto> => {
        const response = await api.get<ClientDetailResponseDto>(`/users/clients/${id}`);
        return response.data;
    },

    findAllAgents: async (params?: AgentsFilterDto): Promise<PaginatedAgentsResponseDto> => {
        const response = await api.get('/users/agents', { params });
        return response.data;
    },

    findOneAgent: async (id: string): Promise<AgentResponseDto> => {
        const response = await api.get<AgentResponseDto>(`/users/agents/${id}`);
        return response.data;
    },

    findOneAgentCatalog: async (id: string): Promise<AgentCatalogResponseDto> => {
        const response = await api.get<AgentCatalogResponseDto>(`/users/agents/${id}/catalog`);
        return response.data;
    },

    findAllClientsByAgent: async (id: string, params?: ClientsFilterDto): Promise<PaginatedClientsResponseDto> => {
        const response = await api.get(`/users/agents/${id}/clients`, { params });
        return response.data;
    },

    findShippingAddresses: async (id: string): Promise<Address[]> => {
        const response = await api.get(`/users/clients/${id}/shipping-addresses`);
        return response.data;
    },

    assignCredit: async (dto: AssignClientCreditDto): Promise<void> => {
        await api.patch('/users/clients/assign-credit', dto);
    },

    removeCredit: async (dto: AssignClientCreditDto): Promise<void> => {
        await api.patch(`/users/clients/remove-credit/${dto.userId}`);
    },

    assignAgent: async (dto: AssignAgentDto): Promise<void> => {
        await api.patch('/users/clients/assign-agent', dto);
    },

    updateStatus: async (id: string, action: 'activate' | 'desactivate'): Promise<void> => {
        await api.patch(`/users/clients/${action}/${id}`);
    },

    updateAgentStatus: async (id: string, action: 'activate' | 'desactivate'): Promise<void> => {
        await api.patch(`/users/agents/${action}/${id}`);
    },

    updateClientProfile: async (id: string, dto: UpdateClientProfileDto): Promise<void> => {
        await api.patch(`/users/clients/${id}`, dto);
    },
};
