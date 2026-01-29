import api from '../api/axios';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/categories';

export const CategoriesService = {
    findAll: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },

    findOne: async (id: string): Promise<Category> => {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    },

    create: async (data: CreateCategoryDto): Promise<Category> => {
        const response = await api.post<Category>('/categories', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
        const response = await api.patch<Category>(`/categories/${id}`, data);
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
};
