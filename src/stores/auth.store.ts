import { create } from 'zustand';
import { AuthService } from '../services/auth.service';
import { useSocketStore } from './socket.store';
import { LoginDto, User } from '../types/auth';

export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

interface AuthState {
    status: AuthStatus;
    user: User | null;
    token: string | null;
    errorMessage: string | null;

    login: (loginDto: LoginDto) => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    status: 'checking',
    user: null,
    token: null,
    errorMessage: null,

    login: async (loginDto: LoginDto) => {
        // set({ status: 'checking', errorMessage: null });
        set({ errorMessage: null });
        try {
            const response = await AuthService.login(loginDto);
            const { accessToken, refreshToken, user } = response;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user)); // Optional: nice to have for faster init, though checking token is safer

            set({
                status: 'authenticated',
                token: accessToken,
                user: user,
                errorMessage: null,
            });

            // Connect socket
            useSocketStore.getState().connect(accessToken);

        } catch (error: any) {
            set({
                status: 'not-authenticated',
                token: null,
                user: null,
                errorMessage: error.response?.data?.message || 'Login failed',
            });
        }
    },

    checkAuthStatus: async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            set({ status: 'not-authenticated', token: null, user: null });
            return;
        }

        try {
            const user = await AuthService.getProfile();

            set({
                status: 'authenticated',
                token: token,
                user: user,
                errorMessage: null,
            });

            // Connect socket
            useSocketStore.getState().connect(token);

        } catch (error) {
            // If valid token check fails, logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            set({ status: 'not-authenticated', token: null, user: null });
            useSocketStore.getState().disconnect();
        }
    },

    logout: async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // Optimistic logout state update
        set({ status: 'not-authenticated', token: null, user: null });
        useSocketStore.getState().disconnect();

        try {
            await AuthService.logout();
        } catch (error) {
            // Ignore logout errors from backend
            console.error('Logout error', error);
        }
    },
}));
