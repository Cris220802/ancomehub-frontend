import { Notification } from './notifications';

export interface ServerToClientEvents {
    notification: (payload: Notification) => void;
}

export interface ClientToServerEvents {
    // Add client events here if needed
}
