import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoriesService } from '../../../services/categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../../../types/categories';

export const useCategories = () => {
    const queryClient = useQueryClient();

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: CategoriesService.findAll,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateCategoryDto) => CategoriesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => CategoriesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => CategoriesService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    return {
        categories: categoriesQuery.data ?? [],
        isLoading: categoriesQuery.isLoading,
        isError: categoriesQuery.isError,
        error: categoriesQuery.error,
        createMutation,
        updateMutation,
        deleteMutation,
    };
};
