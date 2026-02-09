import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/services/users.service';
import {
    AssignClientCreditDto,
    ClientsFilterDto,
    InviteUserDto,
    updateClientDataDto,
} from '@/types/users';
import { toast } from 'sonner';

export const useAdminClients = () => {
    const queryClient = useQueryClient();

    const useGetClients = (filters?: ClientsFilterDto) => {
        return useQuery({
            queryKey: ['admin-clients', filters],
            queryFn: () => UsersService.findAllClients(filters),
        });
    };

    const useGetClientDetail = (id: string) => {
        return useQuery({
            queryKey: ['admin-client-detail', id],
            queryFn: () => UsersService.findOneClient(id),
            enabled: !!id,
        });
    };

    const useInviteClient = () => {
        return useMutation({
            mutationFn: (dto: InviteUserDto) => UsersService.invite(dto),
            onSuccess: () => {
                toast.success('Invitación enviada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
            },
            onError: (error: any) => {
                console.log(error);
                toast.error(error.response?.data?.message || 'Error al enviar invitación');
            },
        });
    };

    const useBeforeInviteClient = () => {
        return useMutation({
            mutationFn: (dto: InviteUserDto) => UsersService.beforeInvite(dto),
            onSuccess: () => {
                toast.success('Invitación enviada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
            },
            onError: (error: any) => {

            },
        });
    };

    const useUpdateClientStatus = () => {
        return useMutation({
            mutationFn: ({ id, action }: { id: string; action: 'activate' | 'desactivate' }) =>
                UsersService.updateStatus(id, action),
            onSuccess: () => {
                toast.success('Estatus actualizado correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
                queryClient.invalidateQueries({ queryKey: ['admin-client-detail'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar estatus');
            },
        });
    };

    const useUpdateClientData = () => {
        return useMutation({
            mutationFn: ({ id, dto }: { id: string; dto: updateClientDataDto }) =>
                UsersService.updateClientData(id, dto),
            onSuccess: () => {
                toast.success('Información actualizada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
                queryClient.invalidateQueries({ queryKey: ['admin-client-detail'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar información');
            },
        });
    };

    const useManageCredit = () => {
        return useMutation({
            mutationFn: async (dto: AssignClientCreditDto) => {
                if (dto.creditEnabled === false) {
                    await UsersService.removeCredit(dto);
                } else {
                    await UsersService.assignCredit(dto);
                }
            },
            onSuccess: () => {
                toast.success('Crédito actualizado correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
                queryClient.invalidateQueries({ queryKey: ['admin-client-detail'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar crédito');
            },
        });
    };

    return {
        useGetClients,
        useGetClientDetail,
        useInviteClient,
        useBeforeInviteClient,
        useUpdateClientStatus,
        useUpdateClientData,
        useManageCredit,
    };
};
