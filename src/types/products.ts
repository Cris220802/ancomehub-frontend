export type Unit = 'PZA' | 'PAIR';

export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    imageUrl: string;
    datasheetUrl: string;
    availableStock: boolean;
    leadTimeDays: number;
    category: any; // Ref: any or { id: string; name: string; }
    unit: Unit;
}

export interface ProductAdmin {
    id: string;
    sku: string;
    name: string;
    description: string;
    imageUrl: string;
    datasheetUrl: string;
    basePrice: number;
    availableStock: boolean;
    leadTimeDays: number;
    category: any; // Ref: any or { id: string; name: string; }
    unit: Unit;
    stock: number;
    isActive: boolean;
    allowBackorder: boolean;
    maxBackorder?: number;
}

export interface CreateProductDto {
    sku: string;
    name: string;
    description: string;
    basePrice: number;
    stock: number;
    unit: Unit;
    leadTimeDays: number;
    categoryId: string;
    image?: File;
    datasheet?: File;
    allowBackorder: boolean;
    maxBackorder?: number;
}

export interface UpdateProductDto {
    sku: string;
    name: string;
    description: string;
    basePrice: number;
    unit: Unit;
    leadTimeDays: number;
    categoryId: string;
    image?: File;
    datasheet?: File;
    allowBackorder: boolean;
    maxBackorder?: number;
}

export interface FilterProductDto {
    categoryId?: string;
    limit?: number;
    page?: number;
    immediateDelivery?: boolean;
}

export interface filterProductDtoAdmin {
    categoryId?: string;
    productName?: string;
    isActive?: boolean;
    limit?: number;
    page?: number;
}

export interface productMeta {
    total: number;
    lastPage: number;
    page: number;
}
export interface ProductResponse {
    products: Product[];
    meta: productMeta;
}

export interface ProductResponseAdmin {
    products: ProductAdmin[];
    meta: productMeta;
}

export interface CatalogCategory {
    id: string;
    name: string;
}

export interface CatalogProduct {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    datasheetUrl: string; // Puede ser null si en la BD lo permites, si no, string
    category: CatalogCategory;
}

export interface CatalogFilters {
    page?: number;
    limit?: number;
    categoryId?: string; // UUID
    productName?: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    lastPage: number;
}

export interface PaginatedCatalogResponse {
    // NOTA: En tu DTO backend pusiste 'items', pero en el return del service pusiste 'products'.
    // He puesto 'items' asumiendo que corregirás el backend para que coincida con tu DTO.
    // Si no lo corriges, cambia esto a: products: CatalogProduct[];
    items: CatalogProduct[];
    meta: PaginationMeta;
}

/**
 * Respuesta para el detalle de un producto (/catalog/:id)
 */
export type ProductDetailCatalogResponse = CatalogProduct;