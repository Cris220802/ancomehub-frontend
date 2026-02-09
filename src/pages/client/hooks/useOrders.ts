import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { OrdersService } from '../../../services/orders.service';
import { OrderFilters } from '../../../types/orders';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CartService } from '@/services/cart.service';

export const useOrders = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // --- Queries ---
    const useOrdersList = (filters?: OrderFilters) => useQuery({
        queryKey: ['orders', filters],
        queryFn: () => OrdersService.findAllOrders(filters),
    });

    const useQuotesList = (filters?: OrderFilters) => useQuery({
        queryKey: ['quotes', filters],
        queryFn: () => OrdersService.findAllQuotes(filters),
    });

    const useOrderDetail = (id: string) => useQuery({
        queryKey: ['order', id],
        queryFn: () => OrdersService.findOne(id),
        enabled: !!id,
    });

    const useQuoteDetail = (id: string) => useQuery({
        queryKey: ['quote', id],
        queryFn: () => OrdersService.findOneQuote(id),
        enabled: !!id,
    });

    // --- UI State ---
    const [showIncompleteProfileDialog, setShowIncompleteProfileDialog] = useState(false);

    // --- Mutations ---
    // const createOrderMutation = useMutation({
    //     mutationFn: OrdersService.createOrder,
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['orders'] });
    //         queryClient.invalidateQueries({ queryKey: ['cart'] });
    //         CartService.clearCart().then(() => {
    //             queryClient.invalidateQueries({ queryKey: ['cart'] });
    //         });

    //         toast.success("Pedido creado exitosamente");
    //         navigate('/orders');
    //     },
    //     onError: (error: any) => {
    //         // Check for specific error message or code
    //         // Backend throws: BadRequestException('User information is not completed')
    //         // Which usually comes as 400 Bad Request with message "User information is not completed"
    //         if (error.response?.data?.message === 'User information is not completed') {
    //             setShowIncompleteProfileDialog(true);
    //         } else {
    //             toast.error("Error al crear el pedido: " + (error.response?.data?.message || "Error desconocido"));
    //         }
    //     }
    // });

    // const createPreviewOrderMutation = useMutation({
    //     mutationFn: OrdersService.createPreviewOrder,
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['orders'] });
    //         queryClient.invalidateQueries({ queryKey: ['cart'] });
    //     },
    //     onError: (error: any) => {
    //         if (error.response?.data?.message === 'User information is not completed') {
    //             setShowIncompleteProfileDialog(true);
    //         } else {
    //             toast.error("Error al crear el pedido: " + (error.response?.data?.message || "Error desconocido"));
    //         }
    //     }
    // });

    const createQuoteMutation = useMutation({
        mutationFn: OrdersService.createQuote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            CartService.clearCart().then(() => {
                queryClient.invalidateQueries({ queryKey: ['cart'] });
            });
            toast.success("Cotización solicitada exitosamente");
            navigate('/quotes');
        },
        onError: (error: any) => {
            if (error.response?.data?.message === 'User information is not completed') {
                setShowIncompleteProfileDialog(true);
            } else {
                toast.error("Error al solicitar cotización: " + (error.response?.data?.message || "Error desconocido"));
            }
        }
    });

    const downloadQuotePdfMutation = useMutation({
        mutationFn: async ({ id, folio }: { id: string; folio: string }) => {
            await OrdersService.downloadQuotePdf(id, folio);
        },
        onError: (error: any) => {
            toast.error("Error al descargar PDF: " + (error.response?.data?.message || "Error desconocido"));
        }
    });

    const convertQuoteToOrderMutation = useMutation({
        mutationFn: ({ data, id }: { data: any, id: string }) => OrdersService.convertQuoteToOrder(data, id),
        onSuccess: (order) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            toast.success("Cotización convertida a pedido exitosamente");
            navigate(`/orders/${order.id}`);
        },
        onError: (error: any) => {
            if (error.response?.data?.message === 'Order purchase document is required') {
                return;
            } else if (error.response?.data?.message === 'You are not authorized to convert this quote') {
                return;
            } else if (error.response?.data?.message === 'User credit is disabled') {
                return;
            } else {
                toast.error("Error al convertir cotización: " + (error.response?.data?.message || "Error desconocido"));
            }
        }
    });

    const previewQuoteToOrderMutation = useMutation({
        mutationFn: OrdersService.previewQuoteToOrder,
        onError: (error: any) => {
            toast.error("Error al verificar disponibilidad: " + (error.response?.data?.message || "Error desconocido"));
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => OrdersService.cancel(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order'] });
            toast.success("Pedido cancelado exitosamente");
        },
        // Error handling will be done in the component for the specific case
    });

    return {
        useOrdersList,
        useQuotesList,
        useOrderDetail,
        useQuoteDetail,
        // createOrder: createOrderMutation.mutateAsync,
        // createOrderPreview: createPreviewOrderMutation.mutateAsync,
        // isCreatingOrderPreview: createPreviewOrderMutation.isPending,
        // isCreatingOrder: createOrderMutation.isPending,
        createQuote: createQuoteMutation.mutateAsync,
        isCreatingQuote: createQuoteMutation.isPending,
        downloadQuotePdf: downloadQuotePdfMutation.mutateAsync,
        isDownloadingQuotePdf: downloadQuotePdfMutation.isPending,
        convertQuoteToOrder: convertQuoteToOrderMutation.mutateAsync,
        isConvertingQuoteToOrder: convertQuoteToOrderMutation.isPending,
        previewQuoteToOrder: previewQuoteToOrderMutation.mutateAsync,
        isPreviewingQuoteToOrder: previewQuoteToOrderMutation.isPending,
        cancelOrder: cancelOrderMutation.mutateAsync,
        isCancellingOrder: cancelOrderMutation.isPending,
        showIncompleteProfileDialog,
        setShowIncompleteProfileDialog,
    };
};
