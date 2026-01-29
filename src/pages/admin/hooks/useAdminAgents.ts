import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/services/users.service';
import { AgentsFilterDto, CreateUserDto, UpdateUserDto, AssignAgentDto, ClientsFilterDto } from '@/types/users';
import { toast } from 'sonner';

export const useAdminAgents = () => {
    const queryClient = useQueryClient();

    const useGetAgents = (filters?: AgentsFilterDto) => {
        return useQuery({
            queryKey: ['admin-agents', filters],
            queryFn: () => UsersService.findAllAgents(filters),
        });
    };

    const useGetAgent = (id: string) => {
        return useQuery({
            queryKey: ['admin-agent-detail', id],
            queryFn: () => UsersService.findOneAgent(id),
            enabled: !!id,
        });
    };

    const useCreateAgent = () => {
        return useMutation({
            mutationFn: (dto: CreateUserDto) => UsersService.create(dto),
            onSuccess: () => {
                toast.success('Agente creado correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al crear agente');
            },
        });
    };

    const useUpdateAgent = () => {
        return useMutation({
            mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => UsersService.update(id, dto),
            onSuccess: (_, { id }) => {
                toast.success('Agente actualizado correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
                queryClient.invalidateQueries({ queryKey: ['admin-agent-detail', id] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar agente');
            },
        });
    };

    const useToggleAgentStatus = () => {
        return useMutation({
            mutationFn: ({ id, action }: { id: string; action: 'activate' | 'desactivate' }) =>
                UsersService.updateStatus(id, action),
            onSuccess: () => {
                toast.success('Estatus actualizado correctamente');
                queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al actualizar estatus');
            },
        });
    };

    const useAssignAgent = () => {
        return useMutation({
            mutationFn: (dto: AssignAgentDto) => UsersService.assignAgent(dto),
            onSuccess: () => {
                toast.success('Cliente asignado correctamente');
                // Invalidating generic clients query or specific queries might be hard without knowing keys used in other hooks
                // Assuming 'admin-clients' might be used elsewhere if we want to reflect change.
                queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al asignar agente');
            },
        });
    };

    const useGetAgentClients = (agentId: string, filters?: ClientsFilterDto) => {
        return useQuery({
            queryKey: ['admin-clients', agentId, filters],
            queryFn: () => UsersService.findAllClientsByAgent(agentId, filters),
            enabled: !!agentId,
        });
    };

    return {
        useGetAgents,
        useGetAgent,
        useCreateAgent,
        useUpdateAgent,
        useToggleAgentStatus,
        useAssignAgent,
        useGetAgentClients,
    };
};
