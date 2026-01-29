import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { Notification } from '../types/notifications';
import { ClientToServerEvents, ServerToClientEvents } from '../types/socket.ts';

interface SocketState {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
    isConnected: boolean;
    liveNotifications: Notification[];
    connect: (token: string) => void;
    disconnect: () => void;
    clearNotifications: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    liveNotifications: [],

    connect: (token: string) => {
        const { socket } = get();
        if (socket) return;

        const newSocket = io(import.meta.env.VITE_API_URL, {
            extraHeaders: {
                Authorization: `Bearer ${token}`,
            },
            query: {
                token,
            },
        });

        newSocket.on('connect', () => {
            set({ isConnected: true });
        });

        newSocket.on('disconnect', () => {
            set({ isConnected: false });
        });

        newSocket.on('notification', (payload: Notification) => {
            set((state) => ({
                liveNotifications: [payload, ...state.liveNotifications],
            }));
        });

        set({ socket: newSocket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
        }
        set({ socket: null, isConnected: false });
    },

    clearNotifications: () => {
        set({ liveNotifications: [] });
    },
}));
