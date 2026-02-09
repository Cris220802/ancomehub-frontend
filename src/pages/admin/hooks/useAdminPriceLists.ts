
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PricingService } from '@/services/pricing.service';
import {
    AssignPriceListDto,
    CreatePriceListDto,
    FilterPriceListDto,
    UpdatePriceListDto,
    UpsertPriceListItemDto,
    UnassignPriceListDto,
} from '@/types/pricing';
import { toast } from 'sonner';

export const useAdminPriceLists = () => {
    const queryClient = useQueryClient();

    // --- LISTS ---

    const useGetPriceLists = (filters: FilterPriceListDto) => {
        return useQuery({
            queryKey: ['admin-price-lists', filters],
            queryFn: () => PricingService.findAllLists(filters),
        });
    };

    const useGetPriceListDetail = (id: string) => {
        return useQuery({
            queryKey: ['admin-price-list-detail', id],
            queryFn: () => PricingService.findOneList(id),
            enabled: !!id,
        });
    };

    const useCreatePriceList = () => {
        return useMutation({
            mutationFn: (data: CreatePriceListDto) => PricingService.createList(data),
            onSuccess: () => {
                toast.success('Lista de precios creada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-price-lists'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al crear lista de precios');
            },
        });
    };

    const useUpdatePriceList = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: UpdatePriceListDto }) =>
                PricingService.updateList(id, data),
            onSuccess: (_, { id }) => {
                toast.success('Lista de precios actualizada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-price-lists'] });
                queryClient.invalidateQueries({ queryKey: ['admin-price-list-detail', id] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar lista de precios');
            },
        });
    };

    const useRemovePriceList = () => {
        return useMutation({
            mutationFn: (id: string) => PricingService.removeList(id),
            onSuccess: () => {
                toast.success('Lista de precios eliminada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-price-lists'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al eliminar lista de precios');
            },
        });
    };

    // --- ITEMS (RULES) ---

    // Note: Items are usually fetched within the Detail Query, so we don't strictly need a separate fetch for items 
    // unless we want to paginate them separately inside the tab. 
    // If the PriceListDetail API returns all items, we are good. 
    // If we need to paginate items separately, we might need a useGetPriceListItems hook if the API supports it.
    // Assuming Detail returns items for now as per `findOneList` signature in service.

    const useUpsertPriceListItem = () => {
        return useMutation({
            mutationFn: (data: UpsertPriceListItemDto) => PricingService.upsertItem(data),
            onSuccess: (_, variables) => {
                toast.success('Regla de precio guardada correctamente');
                // Invalidate the specific list detail to refresh items
                queryClient.invalidateQueries({ queryKey: ['admin-price-list-detail', variables.priceListId] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al guardar regla de precio');
            },
        });
    };

    const useRemovePriceListItem = () => {
        return useMutation({
            mutationFn: ({ itemId, listId }: { itemId: string; listId: string }) =>
                PricingService.removeItem(itemId),
            onSuccess: (_, { listId }) => {
                toast.success('Regla de precio eliminada correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-price-list-detail', listId] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al eliminar regla de precio');
            },
        });
    };

    // --- CLIENT ASSIGNMENT ---

    const useAssignClients = () => {
        return useMutation({
            mutationFn: (data: AssignPriceListDto) => PricingService.assignToClients(data),
            onSuccess: (_, variables) => {
                toast.success('Clientes asignados correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-price-list-detail', variables.listId] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al asignar clientes');
            },
        });
    };

    const useUnassignClient = () => {
        return useMutation({
            mutationFn: (data: UnassignPriceListDto) => PricingService.unassignFromClients(data),
            onSuccess: (_, variables) => {
                toast.success('Cliente desasignado correctamente');
                // We need the listId to invalidate the query, but unassignFromClients only takes userId (UnassignPriceListDto).
                // However, the queryKey for detail is ['admin-price-list-detail', listId].
                // We don't have listId in the mutation variables directly if DTO only has userId.
                // But wait, UnassignPriceListDto (from user changes) only has userId:
                // export interface UnassignPriceListDto { userId: string; }
                // Use invalidating all lists or maybe we can pass listId as part of context or just invalidate all details?
                // Better approach: Since we are in the detail page, we can invalidate specifically the list we are viewing.
                // But the hook is generic. 
                // Let's modify the hook to accept listId if needed for invalidation or just invalidate 'admin-price-list-detail'.
                // Ideally, we should receive listId in the mutation wrapper or invalidating 'admin-price-list-detail' generally (all keys starting with it?)
                // Actually, queryClient.invalidateQueries({ queryKey: ['admin-price-list-detail'] }) will invalidate all details, which is safe enough.
                queryClient.invalidateQueries({ queryKey: ['admin-price-list-detail'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al desasignar cliente');
            },
        });
    };

    return {
        useGetPriceLists,
        useGetPriceListDetail,
        useCreatePriceList,
        useUpdatePriceList,
        useRemovePriceList,
        useUpsertPriceListItem,
        useRemovePriceListItem,
        useAssignClients,
        useUnassignClient,
        queryClient
    };
};
