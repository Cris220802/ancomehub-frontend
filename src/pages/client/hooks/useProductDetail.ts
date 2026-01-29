import { useQuery } from '@tanstack/react-query';
import { ProductsService } from '../../../services/products.service';

export const useProductDetail = (id: string) => {
    const query = useQuery({
        queryKey: ['product', id],
        queryFn: () => ProductsService.findOne(id),
        enabled: !!id,
        retry: 1,
    });

    return {
        product: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
};
