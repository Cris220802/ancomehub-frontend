import { Bell, CheckCheck, Inbox } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/pages/public/hooks/useNotifications";

export const NotificationsMenu = () => {
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        formatTimeAgo
    } = useNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96" align="end" forceMount>
                <DropdownMenuLabel className="p-4 flex items-center justify-between">
                    <span className="font-bold text-gray-900">Notificaciones</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-primary hover:text-primary/80"
                            onClick={() => markAllAsRead()}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Marcar leídas
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <Inbox className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">No tienes notificaciones</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-gray-50",
                                        !notification.isRead && "bg-blue-50/50"
                                    )}
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                >
                                    <div className="flex w-full justify-between gap-2">
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            !notification.isRead ? "text-gray-900" : "text-gray-700"
                                        )}>
                                            {notification.title}
                                        </span>
                                        {!notification.isRead && (
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 w-full">
                                        {notification.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 mt-1">
                                        {formatTimeAgo(notification.createdAt)}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
