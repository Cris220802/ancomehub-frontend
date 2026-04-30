import api from '@/api/axios';
import {
    Warehouse,
    CreateWarehouseDto,
    CreateMovementDto,
    Movement,
    InventoryFilters,
    PaginatedInventoryResponse
} from '@/types/warehouse';

export const warehouseService = {
    // Listar todos los almacenes
    findAll: async (): Promise<Warehouse[]> => {
        const { data } = await api.get<Warehouse[]>('/warehouses');
        return data;
    },

    // Crear nuevo almacén
    create: async (dto: CreateWarehouseDto): Promise<Warehouse> => {
        const { data } = await api.post<Warehouse>('/warehouses', dto);
        return data;
    },

    // Crear movimiento de inventario (Entrada/Salida/Ajuste)
    createMovement: async (dto: CreateMovementDto): Promise<Movement[]> => {
        const { data } = await api.post<Movement[]>('/warehouses/movements', dto);
        return data;
    },

    // Obtener inventario de un almacén específico (paginado y filtrado)
    getInventory: async (
        warehouseId: string,
        filters?: InventoryFilters
    ): Promise<PaginatedInventoryResponse> => {
        const { data } = await api.get<PaginatedInventoryResponse>(
            `/warehouses/${warehouseId}/inventory`,
            { params: filters }
        );
        return data;
    },

    getMovementsByProduct: async (warehouseId: string, productId: string): Promise<Movement[]> => {
        const { data } = await api.get<Movement[]>(`/warehouses/${warehouseId}/movements/${productId}`);
        console.log(data);
        return data;
    }
};