import { Product } from './products';

export interface PriceList {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface PriceListItem {
    id: string;
    priceListId: string;
    productId: string;
    fixedPrice?: number | null;
    discountPercent?: number | null;
    product?: Product;
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
    clientProfileIds: string[];
    listId: string;
}
