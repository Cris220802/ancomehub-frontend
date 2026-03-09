export type NoteStatus = 'ON_TIME' | 'PARTIALLY_PAID_ON_TIME' | 'PARTIALLY_PAID_OVERDUE' | 'OVERDUE' | 'CANCELLED' | 'PAID';

export interface PaginationDto {
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

// ------------------------------------------------------------------------
// Notes DTOs and Types
// ------------------------------------------------------------------------

export interface CreateNoteDto {
    folio: number;
    date: string | Date;
    totalAmount: number;
    subtotalAmount?: number;
    taxAmount?: number;
    creditDays: number;
    notes?: string;
    weakClientId: string;
}

export interface UpdateNoteDto {
    creditDays?: number;
    notes?: string;
    folio?: number;
    date?: string | Date;
    weakClientId?: string;
}

export interface FilterNoteDto extends PaginationDto {
    folio?: string;
    status?: NoteStatus;
    dateFrom?: string | Date;
    dateTo?: string | Date;
}

export interface NoteResponseDto {
    id: string;
    folio: number;
    totalAmount: number;
    subtotalAmount?: number;
    taxAmount?: number;
    date: string | Date;
    dueDate: string | Date;
    status: NoteStatus;
    weakClient: WeakClientResponseDto;
    paidAmount: number;
    pendingAmount: number;
    payments: WeakPaymentResponseDto[];
}

export interface PaginatedNotesResponse extends PaginatedResponse<NoteResponseDto> { }

// ------------------------------------------------------------------------
// Weak Clients DTOs and Types
// ------------------------------------------------------------------------

export interface CreateWeakClientDto {
    name: string;
    phone?: string;
    email?: string;
}

export interface UpdateWeakClientDto extends Partial<CreateWeakClientDto> { }

export interface FilterWeakClientDto extends PaginationDto {
    name?: string;
}

export interface WeakClientResponseDto {
    id: string;
    name: string;
    phone: string;
    email: string;
}

export interface PaginatedWeakClientsResponse extends PaginatedResponse<WeakClientResponseDto> { }

export interface AccountStatementItem {
    id: string;
    folio: number;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    dueDate: string | Date;
    status: NoteStatus;
    // Agrega más propiedades según la respuesta real del backend si es necesario
}

export interface ClientAccountStatementResponse {
    client: WeakClientResponseDto;
    notes: AccountStatementItem[];
    totalBalance: number;
}

// ------------------------------------------------------------------------
// Weak Payments DTOs and Types
// ------------------------------------------------------------------------

export interface CreateWeakPaymentDto {
    amount: number;
    paymentDate?: string | Date;
    notes?: string;
    noteId: string;
}

export interface UpdateWeakPaymentDto extends Partial<CreateWeakPaymentDto> { }

export interface WeakPaymentResponseDto {
    id: string;
    amount: number;
    paymentDate: string | Date;
    notes?: string;
    noteId: string;
    createdAt?: string | Date;
}
