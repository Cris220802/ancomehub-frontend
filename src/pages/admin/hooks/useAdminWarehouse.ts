
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '@/services/warehouse.service';
import { CreateMovementDto, CreateWarehouseDto } from '@/types/warehouse';
import { toast } from 'sonner';

export const useWarehouses = () => {
    const queryClient = useQueryClient();

    // --- QUERIES ---

    const useGetWarehouses = () => {
        return useQuery({
            queryKey: ['warehouses'],
            queryFn: warehouseService.findAll,
            staleTime: 1000 * 60 * 5, // 5 minutos
        });
    };

    const useGetInventory = (warehouseId: string | null) => {
        return useQuery({
            queryKey: ['warehouse-inventory', warehouseId],
            queryFn: () => warehouseService.getInventory(warehouseId!),
            enabled: !!warehouseId, // Solo ejecuta si hay ID
        });
    };

    // --- MUTATIONS ---

    const useCreateWarehouse = () => {
        return useMutation({
            mutationFn: (dto: CreateWarehouseDto) => warehouseService.create(dto),
            onSuccess: () => {
                toast.success('Almacén creado exitosamente');
                queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al crear almacén');
            }
        });
    };

    const useCreateMovement = () => {
        return useMutation({
            mutationFn: (dto: CreateMovementDto) => warehouseService.createMovement(dto),
            onSuccess: (_, variables) => {
                toast.success('Movimiento registrado correctamente');

                // Invalidar inventario del almacén afectado
                queryClient.invalidateQueries({
                    queryKey: ['warehouse-inventory', variables.warehouseId]
                });

                // Invalidar productos globales (ya que el stock global cambia)
                queryClient.invalidateQueries({ queryKey: ['products'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Error al registrar movimiento');
            }
        });
    };

    const useGetMovementsByProduct = (warehouseId: string, productId: string) => {
        return useQuery({
            queryKey: ['warehouse-movements', warehouseId, productId],
            queryFn: () => warehouseService.getMovementsByProduct(warehouseId, productId),
            enabled: !!warehouseId && !!productId,
        });
    };

    return {
        useGetWarehouses,
        useGetInventory,
        useCreateWarehouse,
        useCreateMovement,
        useGetMovementsByProduct
    };
};