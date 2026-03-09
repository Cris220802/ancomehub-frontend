import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NoteService } from '@/services/note.service';
import { FilterWeakClientDto, CreateWeakClientDto, UpdateWeakClientDto } from '@/types/note';
import { toast } from 'sonner';

export const useAdminWeakClient = () => {
    const queryClient = useQueryClient();

    // ------------------------------------------------------------------------
    // Weak Clients Queries
    // ------------------------------------------------------------------------

    const useWeakClients = (filters?: FilterWeakClientDto) => {
        return useQuery({
            queryKey: ['admin-weak-clients', filters],
            queryFn: () => NoteService.findAllWeakClients(filters),
        });
    };

    const useWeakClientDetail = (id: string) => {
        return useQuery({
            queryKey: ['admin-weak-client', id],
            queryFn: () => NoteService.findOneWeakClient(id),
            enabled: !!id,
        });
    };

    const useAccountStatement = (id: string) => {
        return useQuery({
            queryKey: ['admin-client-account-statement', id],
            queryFn: () => NoteService.getAccountStatement(id),
            enabled: !!id,
        });
    };

    // ------------------------------------------------------------------------
    // Weak Clients Mutations
    // ------------------------------------------------------------------------

    const useCreateWeakClient = () => {
        return useMutation({
            mutationFn: (data: CreateWeakClientDto) => NoteService.createWeakClient(data),
            onSuccess: () => {
                toast.success('Cliente registrado exitosamente');
                queryClient.invalidateQueries({ queryKey: ['admin-weak-clients'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al registrar el cliente');
            },
        });
    };

    const useUpdateWeakClient = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: UpdateWeakClientDto }) => NoteService.updateWeakClient(id, data),
            onSuccess: (_, { id }) => {
                toast.success('Información del cliente actualizada');
                queryClient.invalidateQueries({ queryKey: ['admin-weak-clients'] });
                queryClient.invalidateQueries({ queryKey: ['admin-weak-client', id] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar el cliente');
            },
        });
    };

    const useDeleteWeakClient = () => {
        return useMutation({
            mutationFn: (id: string) => NoteService.removeWeakClient(id),
            onSuccess: () => {
                toast.success('Cliente eliminado exitosamente');
                queryClient.invalidateQueries({ queryKey: ['admin-weak-clients'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al eliminar el cliente');
            },
        });
    };

    return {
        // Queries
        useWeakClients,
        useWeakClientDetail,
        useAccountStatement,
        // Mutations
        useCreateWeakClient,
        useUpdateWeakClient,
        useDeleteWeakClient,
        queryClient,
    };
};
