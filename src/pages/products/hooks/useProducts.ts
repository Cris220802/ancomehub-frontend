import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductsService } from '../../../services/products.service';
import { CreateProductDto, UpdateProductDto, filterProductDtoAdmin } from '../../../types/products';
import { useAuthStore } from '../../../stores/auth.store';

export const useProducts = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [filters, setFilters] = useState<filterProductDtoAdmin>({ limit: 10, page: 1 });
    const [searchId, setSearchId] = useState<string>('');

    const isClient = user?.role === 'CLIENT';

    const productsQuery = useQuery({
        queryKey: ['products', user?.role, filters],
        queryFn: async () => {
            if (isClient) {
                return ProductsService.findAllClient(filters);
            }
            // Por defecto asumimos Admin (o si añades más roles, ajusta aquí)
            return ProductsService.findAllAdmin(filters);
        },

        // Solo ejecutamos si no estamos buscando por ID y si hay un usuario logueado
        enabled: !searchId && !!user?.role,
    });

    // --- El resto se mantiene casi igual, con pequeños ajustes en invalidación ---

    const productQuery = useQuery({
        queryKey: ['product', searchId],
        queryFn: () => {
            if (isClient) {
                return ProductsService.findOne(searchId);
            }
            // Por defecto asumimos Admin (o si añades más roles, ajusta aquí)
            return ProductsService.findOneAdmin(searchId);
        },
        enabled: !!searchId && searchId.length > 0,
        retry: 0,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateProductDto) => ProductsService.create(data),
        onSuccess: () => {
            // Invalidamos todo lo que empiece por 'products' (incluye admin y client)
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            // Invalidamos todo lo que empiece por 'products' (incluye admin y client)
            queryClient.invalidateQueries({ queryKey: ['products'] });
            console.log(error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) => ProductsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (searchId) queryClient.invalidateQueries({ queryKey: ['product', searchId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ProductsService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, action }: { id: string; action: 'activate' | 'desactivate' }) =>
            ProductsService.toggleStatus(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (searchId) queryClient.invalidateQueries({ queryKey: ['product', searchId] });
        },
    });

    // Determine return data
    const productsData = searchId
        ? (productQuery.data ? [productQuery.data] : [])
        : productsQuery.data?.products ?? [];

    const metaData = searchId
        ? { total: 1, lastPage: 1, page: 1 }
        : productsQuery.data?.meta ?? { total: 0, lastPage: 0, page: 0 };

    const isLoading = searchId ? productQuery.isLoading : productsQuery.isLoading;

    return {
        products: productsData,
        meta: metaData,
        isLoading,
        isError: searchId ? productQuery.isError : productsQuery.isError,
        error: searchId ? productQuery.error : productsQuery.error,
        filters,
        setFilters,
        searchId,
        setSearchId,
        createMutation,
        updateMutation,
        deleteMutation,
        toggleStatusMutation,
        // Opcional: podrías devolver el rol si la vista lo necesita
        role: user?.role
    };
};