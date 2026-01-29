import api from '../api/axios';
import { CatalogFilters, CreateProductDto, FilterProductDto, PaginatedCatalogResponse, Product, ProductDetailCatalogResponse, ProductResponse, UpdateProductDto } from '../types/products';

export const ProductsService = {
    findAllAdmin: async (params?: FilterProductDto): Promise<ProductResponse> => {
        const response = await api.get('/products/admin', { params });
        return response.data;
    },

    findAllClient: async (params?: FilterProductDto): Promise<ProductResponse> => {
        const response = await api.get('/products/client', { params });
        return response.data;
    },

    findAllCatalog: async (params?: CatalogFilters): Promise<PaginatedCatalogResponse> => {
        const response = await api.get<PaginatedCatalogResponse>('/products/catalog', { params });
        return response.data;
    },

    findOneCatalog: async (id: string): Promise<ProductDetailCatalogResponse> => {
        const response = await api.get<ProductDetailCatalogResponse>(`/products/catalog/${id}`);
        return response.data;
    },

    findOne: async (id: string): Promise<Product> => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    create: async (data: CreateProductDto): Promise<Product> => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = (data as any)[key];
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        const response = await api.post<Product>('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: string, data: UpdateProductDto): Promise<Product> => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = (data as any)[key];
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        const response = await api.patch<Product>(`/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/products/${id}`);
    },

    toggleStatus: async (id: string, action: 'activate' | 'desactivate'): Promise<void> => {
        await api.patch(`/products/${action}/${id}`);
    },
};
