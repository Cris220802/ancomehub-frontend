import api from '../api/axios';
import { AuthResponse, LoginDto, RefreshTokenDto, User } from '../types/auth';

export const AuthService = {
    login: async (data: LoginDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/auth/profile');
        return response.data;
    },

    refreshToken: async (): Promise<RefreshTokenDto> => {
        const response = await api.post<RefreshTokenDto>('/auth/refresh');
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },
};
