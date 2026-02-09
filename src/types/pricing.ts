import { Product, ProductAdmin } from './products';

interface User {
    id: string;
    email: string;
    fullName: string | null;
}

interface ClientProfile {
    id: string;
    companyName: string;
    user: User;
}

export interface PriceList {
    id: string;
    name: string;
    description?: string;
}

export interface PriceListDetail extends PriceList {
    createdAt: string;
    updatedAt?: string;

    clientProfiles: ClientProfile[];

    items: PriceListItem[];
}

export interface PriceListItem {
    id: string;
    productId: string;
    fixedPrice?: number | null;
    discountPercent?: number | null;
    product?: ProductAdmin;
}

export interface CreatePriceListDto {
    name: string;
    description?: string;
}

export interface UpdatePriceListDto extends Partial<CreatePriceListDto> { }

export interface UpsertPriceListItemDto {
    priceListId: string;
    productId: string;
    fixedPrice?: number;
    discountPercent?: number;
}

export interface AssignPriceListDto {
    userIds: string[];
    listId: string;
}

export interface UnassignPriceListDto {
    userId: string;
}

export interface PaginatedPriceListResponse {
    items: PriceList[];
    meta: PaginationMeta;
}

interface PaginationMeta {
    total: number;
    page: number;
    lastPage: number;
}

export interface FilterPriceListDto {
    page?: number;
    limit?: number;
    name?: string;
}
