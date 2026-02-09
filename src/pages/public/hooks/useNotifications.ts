import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useSocketStore } from "@/stores/socket.store";
import { NotificationsService } from "@/services/notifications.service";
import { Notification } from "@/types/notifications";

export const useNotifications = () => {
    // Estado local para combinar historial + tiempo real
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const { liveNotifications, clearNotifications } = useSocketStore();

    // Cargar historial al montar
    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const response = await NotificationsService.findAll({ page: 1, limit: 10 });
                setNotifications(response.items);
                setUnreadCount(response.meta.unreadCount);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                toast.error("Error al cargar notificaciones");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Escuchar notificaciones en tiempo real del store
    useEffect(() => {
        if (liveNotifications.length === 0) return;

        // Tomamos las nuevas notificaciones del store
        const newNotification = liveNotifications[0]; // La más reciente está al principio según el store

        // Actualizamos estado local
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Disparar toast
        toast.info(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
        });

        // Limpiamos el store para evitar duplicados si liveNotifications no se resetea solo
        // (Aunque el store acumula, aquí asumimos que ya las procesamos. 
        // Si el store acumula sin control, mejor limpiarlo o manejar índices).
        // En este caso, el store hace un append [item, ...state], así que liveNotifications crece.
        // Pero nuestro effect depende de liveNotifications.
        // Si liveNotifications cambia, este effect corre.
        // Para evitar reprocesar todo el array, deberíamos comparar o solo tomar la diferencia.
        // Una estrategia segura es limpiar el store después de consumir, O manejar un índice.
        // Dado que el componente puede desmontarse y el store es global, mejor consumimos y limpiamos 
        // O solo reaccionamos al cambio.

        // Si el store es puramente un "buffer" de eventos recientes, 
        // podemos limpiar después de consumir si somos el único consumidor activo de esta lógica.
        // Asumiendo que este hook es singleton o se usa en una parte central (Layout).
        // Sin embargo, si hay múltiples hooks activos, todos consumirán y limpiarán -> carrera.
        // PERO el user request dice que este hook unifica las fuentes. 
        // Probablemente se use solo en el NotificationsMenu.

        // Optomización: El store agrega al principio.
        // Si liveNotifications cambia y tiene elementos, tomamos el primero (el más nuevo)
        // PERO si el store tiene 10 elementos, y llega el 11, el array cambia.
        // Mejor estrategia:
        // Solo reaccionar a la diferencia o limpiar el store.
        // Vamos a limpiar el store para simplificar, asumiendo que este hook es el "manejador" principal.

        clearNotifications();

    }, [liveNotifications, clearNotifications]);

    // Marcar una como leída
    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await NotificationsService.markAsRead(id);
        } catch (error) {
            console.error("Error marking notification as read", error);
            // Rollback manual si falla (opcional, por ahora solo log)
        }
    };

    // Marcar todas como leídas
    const markAllAsRead = async () => {
        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            await NotificationsService.markAllAsRead();
            toast.success("Todas las notificaciones marcadas como leídas");
        } catch (error) {
            console.error("Error marking all as read", error);
            toast.error("Error al actualizar estado");
        }
    };

    // Utilidad para formatear fecha de cada item
    const formatTimeAgo = useCallback((dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
    }, []);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        formatTimeAgo
    };
};
