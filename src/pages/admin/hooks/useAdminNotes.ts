import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NoteService } from '@/services/note.service';
import { FilterNoteDto, FilterWeakClientDto, CreateWeakPaymentDto, UpdateWeakPaymentDto, UpdateNoteDto, CreateNoteDto } from '@/types/note';
import { toast } from 'sonner';

export const useAdminNotes = () => {
    const queryClient = useQueryClient();

    // ------------------------------------------------------------------------
    // Notes Queries
    // ------------------------------------------------------------------------

    const useNotes = (filters: FilterNoteDto) => {
        return useQuery({
            queryKey: ['admin-notes', filters],
            queryFn: () => NoteService.findAllNotes(filters),
        });
    };

    const useOverdueNotes = (page = 1, limit = 5) => {
        return useQuery({
            queryKey: ['admin-overdue-notes', { page, limit }],
            queryFn: () => NoteService.getOverdueNotes({ page, limit }),
        });
    };

    const useMostOverdueClients = (page = 1, limit = 5) => {
        return useQuery({
            queryKey: ['admin-most-overdue-clients', { page, limit }],
            queryFn: () => NoteService.getMostOverdueClients({ page, limit }),
        });
    };

    const useNoteDetail = (id: string) => {
        return useQuery({
            queryKey: ['admin-note', id],
            queryFn: () => NoteService.findOneNote(id),
            enabled: !!id,
        });
    };

    // ------------------------------------------------------------------------
    // Notes Mutations
    // ------------------------------------------------------------------------

    const useCreateNote = () => {
        return useMutation({
            mutationFn: (data: CreateNoteDto) => NoteService.createNote(data),
            onSuccess: () => {
                toast.success('Nota de crédito creada exitosamente');
                queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
                queryClient.invalidateQueries({ queryKey: ['admin-overdue-notes'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al crear la nota');
            },
        });
    };

    const useUpdateNote = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) => NoteService.updateNote(id, data),
            onSuccess: (_, { id }) => {
                toast.success('Nota actualizada exitosamente');
                queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
                queryClient.invalidateQueries({ queryKey: ['admin-note', id] });
                // En caso de que afecte a otras vistas:
                queryClient.invalidateQueries({ queryKey: ['admin-overdue-notes'] });
                queryClient.invalidateQueries({ queryKey: ['admin-most-overdue-clients'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar la nota');
            },
        });
    };

    const useDeleteNote = () => {
        return useMutation({
            mutationFn: (id: string) => NoteService.removeNote(id),
            onSuccess: () => {
                toast.success('Nota eliminada exitosamente');
                queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
                queryClient.invalidateQueries({ queryKey: ['admin-overdue-notes'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al eliminar la nota');
            },
        });
    };

    // ------------------------------------------------------------------------
    // Weak Clients Queries & Mutations (if needed)
    // ------------------------------------------------------------------------

    const useWeakClients = (filters?: FilterWeakClientDto) => {
        return useQuery({
            queryKey: ['admin-weak-clients', filters],
            queryFn: () => NoteService.findAllWeakClients(filters),
        });
    };

    const useAccountStatement = (clientId: string) => {
        return useQuery({
            queryKey: ['admin-client-account-statement', clientId],
            queryFn: () => NoteService.getAccountStatement(clientId),
            enabled: !!clientId,
        });
    };


    // ------------------------------------------------------------------------
    // Weak Payments Mutations
    // ------------------------------------------------------------------------

    const useCreateWeakPayment = () => {
        return useMutation({
            mutationFn: (data: CreateWeakPaymentDto) => NoteService.createWeakPayment(data),
            onSuccess: (_, variables) => {
                toast.success('Abono registrado exitosamente');
                // Invalidamos el detalle de la nota para ver el abono reflejado
                queryClient.invalidateQueries({ queryKey: ['admin-note', variables.noteId] });
                queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
                queryClient.invalidateQueries({ queryKey: ['admin-overdue-notes'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al registrar el abono');
            },
        });
    };

    const useUpdateWeakPayment = () => {
        return useMutation({
            mutationFn: ({ id, data, noteId }: { id: string; data: UpdateWeakPaymentDto; noteId: string }) =>
                NoteService.updateWeakPayment(id, data),
            onSuccess: (_, variables) => {
                toast.success('Abono actualizado exitosamente');
                queryClient.invalidateQueries({ queryKey: ['admin-note', variables.noteId] });
                queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
                queryClient.invalidateQueries({ queryKey: ['admin-overdue-notes'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar el abono');
            },
        });
    };

    const useDeleteWeakPayment = () => {
        return useMutation({
            mutationFn: ({ id, noteId }: { id: string; noteId: string }) => NoteService.removeWeakPayment(id),
            onSuccess: (_, variables) => {
                toast.success('Abono eliminado exitosamente');
                queryClient.invalidateQueries({ queryKey: ['admin-note', variables.noteId] });
                queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
                queryClient.invalidateQueries({ queryKey: ['admin-overdue-notes'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al eliminar el abono');
            },
        });
    };

    return {
        // Queries
        useNotes,
        useOverdueNotes,
        useMostOverdueClients,
        useNoteDetail,
        useAccountStatement,
        useWeakClients,
        // Mutations
        useCreateNote,
        useUpdateNote,
        useDeleteNote,
        useCreateWeakPayment,
        useUpdateWeakPayment,
        useDeleteWeakPayment,
        queryClient,
    };
};
