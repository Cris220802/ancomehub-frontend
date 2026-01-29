export type UserRole = 'ADMIN' | 'CLIENT' | 'AGENT';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';

export interface CreateUserDto {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    phoneNumber?: string;
}

export interface UpdateUserDto {
    email?: string;
    password?: string;
    fullName?: string;
    role?: UserRole;
    phoneNumber?: string;
}

export interface Address {
    street: string;
    exteriorNumber: string;
    interiorNumber?: string; // Opcional
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
}

export interface UpdateClientProfileDto {
    // Shipping es UN ARREGLO de objetos (Esto es lo más importante)
    shippingAddresses: Address[];
}
export interface InviteUserDto {
    email: string;
    companyName: string;
    taxId?: string;
    phoneNumber?: string;
}

export interface CompleteRegistrationDto {
    token: string;
    fullName: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
}

export interface AgentSummaryDto {
    id: string;
    fullName: string;
    email: string;
}

export interface ClientProfileResponseDto {
    id: string;
    taxId?: string | null;
    companyName: string;
    billingAddress: Record<string, any>;
    shippingAddresses: Record<string, any>;
    creditLimit: number;
    currentCreditUsed: number;
    creditDays?: number;
    creditEnabled?: boolean;
    assignedAgent?: AgentSummaryDto | null;
}

export interface clientProfileForAgentDto {
    id: string;
    companyName: string;
    user: {
        fullName: string;
    }
}

export interface AuditLogSummaryDto {
    id: string;
    action: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

export interface ClientDetailResponseDto {
    id: string;
    email: string;
    fullName?: string | null;
    phoneNumber?: string | null;
    status: UserStatus;
    clientProfile: ClientProfileResponseDto;

    auditLogs: AuditLogSummaryDto[];
}

export interface ClientResponseDto {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    status: string;
    createdAt: string;
}

export interface AgentResponseDto {
    id: string;
    email: string;
    fullName: string;
    status: string;
    clientProfile: clientProfileForAgentDto;
    createdAt: string;
}

export interface AgentCatalogResponseDto {
    email: string;
    fullName: string;
    phoneNumber: string;
}

export interface PaginatedAgentsResponseDto {
    items: AgentResponseDto[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export interface PaginatedClientsResponseDto {
    items: ClientResponseDto[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export interface AssignClientCreditDto {
    userId: string;
    creditEnabled?: boolean;
}

export interface AssignAgentDto {
    clientId: string;
    agentId: string;
}

export interface ClientsFilterDto {
    limit?: number;
    page?: number;
    fullName?: string;
    companyName?: string;
    taxId?: string;
    search?: string;
    status?: UserStatus;
}

export interface AgentsFilterDto {
    limit?: number;
    page?: number;
    fullName?: string;
    email?: string;
    status?: UserStatus;
}
