export enum MovementType {
    IN_PURCHASE = 'IN_PURCHASE',
    IN_TRANSFER = 'IN_TRANSFER',
    IN_ADJUSTMENT = 'IN_ADJUSTMENT',
    OUT_SALE = 'OUT_SALE',
    OUT_TRANSFER = 'OUT_TRANSFER',
    OUT_ADJUSTMENT = 'OUT_ADJUSTMENT',
    // Agrega otros si existen en tu backend
}

export interface Warehouse {
    id: string;
    name: string;
    address?: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWarehouseDto {
    name: string;
    address?: string;
    isDefault?: boolean;
}

export interface MovementItemDto {
    productId: string;
    quantity: number;
}

export interface CreateMovementDto {
    warehouseId: string;
    type: MovementType;
    items: MovementItemDto[];
    reference?: string;
    notes?: string;
}

export interface Movement {
    id: string;
    type: MovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reference?: string;
    notes?: string;
    createdAt: string;
    warehouse: Warehouse;
    product: {
        id: string;
        name: string;
        sku: string;
    };
    user: {
        id: string;
        fullName: string;
    };
}

export interface WarehouseStock {
    id: string;
    quantity: number;
    warehouseId: string;
    productId: string;
    product: {
        id: string;
        name: string;
        sku: string;
        imageUrl?: string;
        stock: number; // Stock global
    };
}

export interface InventoryFilters {
    page?: number;
    limit?: number;
    categoryId?: string;
    productName?: string;
}

export interface PaginatedInventoryResponse {
    items: WarehouseStock[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}