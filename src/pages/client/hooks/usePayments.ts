import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentsService } from '../../../services/payments.service';
import { CreatePaymentDto } from '../../../types/payments';
import { toast } from 'sonner';

export const usePayments = () => {
    const queryClient = useQueryClient();

    const useOrderPayments = (orderId: string) => useQuery({
        queryKey: ['payments', 'order', orderId],
        queryFn: () => PaymentsService.findPaymentsByOrderId(orderId),
        enabled: !!orderId,
    });

    const usePaymentDetail = (id: string) => useQuery({
        queryKey: ['payment', id],
        queryFn: () => PaymentsService.findOne(id),
        enabled: !!id,
    });

    const createPaymentMutation = useMutation({
        mutationFn: (data: CreatePaymentDto) => PaymentsService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['payments', 'order', variables.orderId] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] }); // Update order balance/status
            toast.success("Pago reportado exitosamente");
        },
        onError: (error: any) => {
            toast.error("Error al reportar el pago: " + (error.response?.data?.message || "Error desconocido"));
        }
    });

    return {
        useOrderPayments,
        usePaymentDetail,
        createPayment: createPaymentMutation.mutateAsync,
        isCreatingPayment: createPaymentMutation.isPending,
    };
};
