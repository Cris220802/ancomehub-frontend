
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrdersService } from '@/services/orders.service';
import { PaymentsService } from '@/services/payments.service';
import { ReviewPaymentDto } from '@/types/payments';
import { OrderFilters, OrderStatus, QuoteFilters } from '@/types/orders';
import { toast } from 'sonner';

export const useAdminOrders = () => {
    const queryClient = useQueryClient();

    const useOrders = (filters: OrderFilters) => {
        return useQuery({
            queryKey: ['admin-orders', filters],
            queryFn: () => OrdersService.findAllOrders(filters),
        });
    };

    const useGetClientOrders = (clientId: string, filters?: OrderFilters) => {
        return useQuery({
            queryKey: ['admin-client-orders', clientId, filters],
            queryFn: () => OrdersService.findOrdersByClient(clientId, filters),
            enabled: !!clientId,
        });
    };

    const useOrderDetail = (id: string) => {
        return useQuery({
            queryKey: ['admin-order', id],
            queryFn: () => OrdersService.findOne(id),
            enabled: !!id,
        });
    };

    const useOrderPayments = (orderId: string) => {
        return useQuery({
            queryKey: ['admin-payments', orderId],
            queryFn: () => PaymentsService.findPaymentsByOrderId(orderId),
            enabled: !!orderId,
        });
    };

    const useGetClientQuotes = (clientId: string, filters?: QuoteFilters) => {
        return useQuery({
            queryKey: ['admin-client-quotes', clientId, filters],
            queryFn: () => OrdersService.findQuotesByClient(clientId, filters),
            enabled: !!clientId,
        });
    };

    const useAdminQuote = (id: string) => {
        return useQuery({
            queryKey: ['admin-quote', id],
            queryFn: () => OrdersService.findOneQuote(id),
            enabled: !!id,
        });
    };

    // const useUpdateOrderStatus = () => {
    //     return useMutation({
    //         mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
    //             OrdersService.updateStatus(id, status),
    //         onSuccess: (_, { id }) => {
    //             toast.success("Estado actualizado exitosamente");
    //             queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    //             queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
    //         },
    //         onError: (error: any) => {
    //             toast.error(error.response.data.message);
    //         },
    //     });
    // };

    const useCancelOrder = () => {
        return useMutation({
            mutationFn: ({ id, reason }: { id: string; reason?: string }) => OrdersService.cancel(id, reason),
            onSuccess: (_, { id }) => {
                toast.success("Pedido cancelado exitosamente");
                queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
            },
            onError: (error: any) => {
                toast.error(error.response.data.message);
            }
        });
    };

    const useConfirmOrder = () => {
        return useMutation({
            mutationFn: (id: string) => OrdersService.confirmOrder(id),
            onSuccess: (_, id) => {
                toast.success("Pedido confirmado y stock reservado");
                queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Error al confirmar pedido");
            }
        });
    };

    const useRegisterShipment = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string, data: any }) => OrdersService.registerShipment(id, data),
            onSuccess: (_, { id }) => {
                toast.success("Envío registrado correctamente");
                queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Error al registrar envío");
            }
        });
    };

    const useFulfillBackorders = () => {
        return useMutation({
            mutationFn: (id: string) => OrdersService.fulfillBackorders(id),
            onSuccess: (data, id) => {
                toast.success(data.message || "Backorders surtidos correctamente");
                queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Error al surtir backorders");
            }
        });
    };

    const useReviewPayment = () => {
        return useMutation({
            mutationFn: ({ id, ...data }: ReviewPaymentDto & { id: string }) =>
                PaymentsService.review(id, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
                toast.success("Pago aprovado correctamente");
            },
        });
    };

    return {
        useOrders,
        useGetClientOrders,
        useOrderDetail,
        useOrderPayments,
        useGetClientQuotes,
        useAdminQuote,
        // useUpdateOrderStatus,
        useCancelOrder,
        useReviewPayment,
        useConfirmOrder,
        useRegisterShipment,
        useFulfillBackorders,
        queryClient
    };
};
