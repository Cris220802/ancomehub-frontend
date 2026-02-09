import api from '../api/axios';
import { Notification, NotificationFilter, PaginatedNotificationResponse } from '../types/notifications';

export const NotificationsService = {
    findAll: async (params?: NotificationFilter): Promise<PaginatedNotificationResponse> => {
        const response = await api.get<PaginatedNotificationResponse>('/notifications', { params });
        return response.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.patch('/notifications/read-all');
    },
};
