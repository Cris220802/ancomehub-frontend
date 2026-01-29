
import { useQuery } from "@tanstack/react-query";
import { UsersService } from "@/services/users.service";
import { useAuthStore } from "@/stores/auth.store";

export const useClient = () => {
    const { user } = useAuthStore();

    const shippingAddressesQuery = useQuery({
        queryKey: ['client-shipping-addresses', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            return await UsersService.findShippingAddresses(user.id);
        },
        enabled: !!user?.id,
    });

    return {
        shippingAddresses: shippingAddressesQuery.data || [],
        isLoadingAddresses: shippingAddressesQuery.isLoading,
        isErrorAddresses: shippingAddressesQuery.isError,
    };
};
