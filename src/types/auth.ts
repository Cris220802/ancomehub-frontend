export enum UserRole {
    ADMIN = 'ADMIN',
    CLIENT = 'CLIENT',
    AGENT = 'AGENT',
}

export enum UserStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum UserInformationStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
}

export interface User {
    id: string;
    email: string;
    password?: string;
    fullName: string;
    phoneNumber?: string;
    role: UserRole;
    status: UserStatus;
    informationStatus: UserInformationStatus;
    resetToken?: string;
    currentHashedRefreshToken?: string | null;
    clientProfile?: any;
    assignedClients?: any[];
    auditLogs?: any[];
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RefreshTokenDto {
    accessToken: string;
    refreshToken: string;
}

