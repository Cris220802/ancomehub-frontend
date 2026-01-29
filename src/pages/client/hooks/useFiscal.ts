import { useQuery } from '@tanstack/react-query';
import { FiscalService } from '../../../services/fiscal.service';
import { FiscalFilterDto } from '../../../types/fiscal';

export const useFiscal = () => {

    const useInvoices = (filters?: FiscalFilterDto) => useQuery({
        queryKey: ['fiscal', filters],
        queryFn: () => FiscalService.findAll(filters),
    });

    const useInvoiceDetail = (id: string) => useQuery({
        queryKey: ['fiscal', id],
        queryFn: () => FiscalService.findOne(id),
        enabled: !!id,
    });

    return {
        useInvoices,
        useInvoiceDetail,
    };
};
