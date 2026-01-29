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
