import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UsersService } from '@/services/users.service';
import { Address, UpdateClientProfileDto } from '@/types/users';
import { useAuthStore } from '@/stores/auth.store';

export const useClientProfile = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const clientQuery = useQuery({
        queryKey: ['client-profile', user?.id],
        queryFn: () => UsersService.findOneClient(user!.id),
        enabled: !!user?.id,
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (shippingAddresses: Address[]) => {
            if (!user?.id || !clientQuery.data) return;

            const dto: UpdateClientProfileDto = {
                shippingAddresses,
            };

            await UsersService.updateClientProfile(user.id, dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-profile', user?.id] });
            toast.success('Direcciones actualizadas correctamente');
        },
        onError: (error) => {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar las direcciones');
        },
    });

    return {
        client: clientQuery.data,
        isLoading: clientQuery.isLoading,
        isError: clientQuery.isError,
        updateShippingAddresses: updateProfileMutation.mutateAsync,
        isUpdating: updateProfileMutation.isPending,
    };
};
