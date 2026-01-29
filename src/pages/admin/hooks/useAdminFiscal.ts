import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiscalService } from '@/services/fiscal.service';
import { UsersService } from '@/services/users.service';
import { OrdersService } from '@/services/orders.service';
import {
    FiscalFilterDto,
    FiscalStatus,
    UploadInternalInvoiceDto,
    UploadExternalInvoiceDto,
    UploadRepDto
} from '@/types/fiscal';
import { ClientsFilterDto } from '@/types/users';
import { toast } from 'sonner';

export const useAdminFiscal = () => {
    const queryClient = useQueryClient();

    // --- Queries ---

    const useFiscalDocuments = (filters?: FiscalFilterDto) => {
        return useQuery({
            queryKey: ['admin-fiscal', filters],
            queryFn: () => FiscalService.findAll(filters),
        });
    };

    const useFiscalDetail = (id: string) => {
        return useQuery({
            queryKey: ['admin-fiscal', id],
            queryFn: () => FiscalService.findOne(id),
            enabled: !!id,
        });
    };

    const useClientsSearch = (filters: ClientsFilterDto, enabled: boolean = false) => {
        return useQuery({
            queryKey: ['admin-clients', filters],
            queryFn: () => UsersService.findAllClients(filters),
            enabled,
        });
    };

    const usePendingInvoicingOrders = (page: number = 1, limit: number = 5) => {
        return useQuery({
            queryKey: ['admin-orders-pending-invoicing', page, limit],
            queryFn: () => OrdersService.findPendingInvoicing(page, limit),
        });
    };

    // --- Mutations ---

    const useUploadInternal = () => {
        return useMutation({
            mutationFn: (data: UploadInternalInvoiceDto) => FiscalService.uploadInternal(data),
            onSuccess: (_, variables) => {
                toast.success('Factura interna vinculada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-order', variables.orderId] });
                queryClient.invalidateQueries({ queryKey: ['admin-fiscal'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al subir factura interna');
            },
        });
    };

    const useUploadExternal = () => {
        return useMutation({
            mutationFn: (data: UploadExternalInvoiceDto) => FiscalService.uploadExternal(data),
            onSuccess: () => {
                toast.success('Factura externa subida correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-fiscal'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al subir factura externa');
            },
        });
    };

    const useUploadComplement = () => {
        return useMutation({
            mutationFn: ({ parentId, data }: { parentId: string; data: UploadRepDto }) =>
                FiscalService.uploadComplement(parentId, data),
            onSuccess: (_, variables) => {
                toast.success('Complemento de pago subido correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-fiscal', variables.parentId] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al subir complemento');
            },
        });
    };

    const useUpdateFiscalStatus = () => {
        return useMutation({
            mutationFn: ({ id, status }: { id: string; status: FiscalStatus }) =>
                FiscalService.updateStatus(id, status),
            onSuccess: (_, variables) => {
                toast.success('Estatus actualizado correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-fiscal', variables.id] });
                queryClient.invalidateQueries({ queryKey: ['admin-fiscal'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar estatus');
            },
        });
    };

    const useCancelFiscal = () => {
        return useMutation({
            mutationFn: (id: string) => FiscalService.delete(id),
            onSuccess: () => {
                toast.success('Factura cancelada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-fiscal'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al cancelar factura');
            },
        });
    };

    return {
        useFiscalDocuments,
        useFiscalDetail,
        useClientsSearch,
        usePendingInvoicingOrders,
        useUploadInternal,
        useUploadExternal,
        useUploadComplement,
        useUpdateFiscalStatus,
        useCancelFiscal,
    };
};
