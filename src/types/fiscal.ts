export type FiscalStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type FiscalDocumentType = 'INVOICE' | 'PAYMENT_REP' | 'CREDIT_NOTE';

export interface UploadInternalInvoiceDto {
    orderId: string;
    fiscalUuid: string;
    amount: number;
    creditDays?: number;
    pdf: File;
    xml: File;
}

export interface UploadExternalInvoiceDto {
    clientId: string;
    fiscalUuid: string;
    amount: number;
    creditDays?: number;
    description?: string;
    pdf: File;
    xml: File;
}

export interface UploadRepDto {
    fiscalUuid: string;
    amount: number;
    pdf: File;
    xml: File;
}

export interface UpdateFiscalStatusDto {
    status: FiscalStatus;
}

export interface User {
    id: string;
    fullName: string;
    email: string;

}
export interface Order {
    id: string;
    folio: string;
    totalAmount: number;
    user: User;
}

export interface FiscalDocument {
    id: string;
    fiscalUuid: string;
    type: FiscalDocumentType;
    status: FiscalStatus;
    amount: number;
    pdfUrl: string;
    xmlUrl: string;
    createdAt: string;
    updatedAt?: string;
    uploadedAt?: string;
    order?: Order;
    folio?: string;
}

export interface FiscalDocumentDetail extends FiscalDocument {
    relatedDocuments?: FiscalDocument[];
    // Assuming other details might be present
}

export interface FiscalFilterDto {
    page?: number;
    limit?: number;
    id?: string;
    fiscalUuid?: string;
    clientId?: string;
    status?: FiscalStatus;
    orderId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface PaginatedFiscalResponse {
    items: FiscalDocument[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}
