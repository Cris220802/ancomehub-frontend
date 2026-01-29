import api from '../api/axios';
import { Notification } from '../types/notifications';

export const NotificationsService = {
    findAll: async (): Promise<Notification[]> => {
        const response = await api.get<Notification[]>('/notifications');
        return response.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`);
    },
};
