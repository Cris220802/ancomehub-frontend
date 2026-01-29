import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { useAdminAgents } from '../../hooks/useAdminAgents';
import { useAdminClients } from '../../hooks/useAdminClients';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Search, Check } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { ClientResponseDto } from '@/types/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AssignClientToAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agentId: string;
}

export function AssignClientToAgentDialog({ open, onOpenChange, agentId }: AssignClientToAgentDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { useGetClients } = useAdminClients();
    const { useAssignAgent } = useAdminAgents();

    // Fetch clients only when searching or initially (but filtering helps)
    const { data: clientsData, isLoading } = useGetClients({
        search: debouncedSearch,
        limit: 5 // Limit suggestions
    });

    const assignMutation = useAssignAgent();

    const handleAssign = () => {
        if (!selectedClientId) return;
        assignMutation.mutate({
            agentId: agentId,
            clientId: selectedClientId
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setSearchTerm('');
                setSelectedClientId(null);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Asignar Cliente</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-500">
                        Busca y selecciona un cliente para asignarlo a este agente.
                    </p>

                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar cliente por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedClientId(null); // Reset selection on new search
                            }}
                            className="pl-8"
                        />
                    </div>

                    <div className="border rounded-md max-h-[200px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
                        ) : clientsData?.items.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">No se encontraron clientes.</div>
                        ) : (
                            <div className="divide-y">
                                {clientsData?.items.map((client: ClientResponseDto) => (
                                    <div
                                        key={client.id}
                                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${selectedClientId === client.id ? 'bg-primary/5' : ''}`}
                                        onClick={() => setSelectedClientId(client.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://ui-avatars.com/api/?name=${client.fullName}&background=random`} />
                                                <AvatarFallback>{client.fullName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{client.fullName}</p>
                                                <p className="text-xs text-gray-500">{client.email}</p>
                                            </div>
                                        </div>
                                        {selectedClientId === client.id && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedClientId || assignMutation.isPending}
                        isLoading={assignMutation.isPending}
                    >
                        Asignar Cliente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
