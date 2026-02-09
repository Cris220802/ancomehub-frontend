export type NotificationType = 'PAYMENT' | 'ORDER' | 'SYSTEM' | string;

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    metadata?: Record<string, any>;
    createdAt: string;
}

export interface PaginatedNotificationResponse {
    items: Notification[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        unreadCount: number;
    }
}

export interface NotificationFilter {
    page?: number;
    limit?: number;
}
