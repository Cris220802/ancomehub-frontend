
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Search } from 'lucide-react';
import { useAdminPriceLists } from '../../hooks/useAdminPriceLists';
import { useAdminClients } from '../../hooks/useAdminClients';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

interface AssignClientsDialogProps {
    listId: string;
    trigger?: React.ReactNode;
}

export function AssignClientsDialog({ listId, trigger }: AssignClientsDialogProps) {
    const [open, setOpen] = useState(false);
    const { useAssignClients } = useAdminPriceLists();
    const { useGetClients } = useAdminClients();
    const assignMutation = useAssignClients();

    // Client Search State
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch clients
    const { data, isLoading } = useGetClients({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
    });

    const handleToggle = (id: string, checked: boolean) => {
        const next = new Set(selectedIds);
        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }
        setSelectedIds(next);
    };

    const handleSubmit = () => {
        if (selectedIds.size === 0) return;
        assignMutation.mutate({
            listId,
            userIds: Array.from(selectedIds),
        }, {
            onSuccess: () => {
                setOpen(false);
                setSelectedIds(new Set());
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Asignar Clientes
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Asignar Clientes</DialogTitle>
                    <DialogDescription>
                        Selecciona los clientes que estarán sujetos a esta lista de precios.
                        Se sumarán a los ya asignados.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-300" /></div>
                    ) : (data?.items?.length ?? 0) === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-500">No se encontraron clientes</div>
                    ) : (
                        data?.items.map((client: any) => (
                            <div key={client.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                <Checkbox
                                    id={client.id}
                                    checked={selectedIds.has(client.id)}
                                    onCheckedChange={(checked) => handleToggle(client.id, checked as boolean)}
                                />
                                <div className="grid gap-1.5 leading-none w-full">
                                    <Label
                                        htmlFor={client.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                {client.fullName?.charAt(0) || 'C'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {client.fullName}
                                    </Label>
                                    <p className="text-xs text-muted-foreground pl-8">
                                        {client.clientProfile?.companyName || client.email}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-2">
                    <CustomPagination
                        meta={data?.meta}
                        onPageChange={setPage}
                    />
                </div>

                <DialogFooter className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center w-full">
                        <span className="text-sm text-muted-foreground">
                            {selectedIds.size} seleccionados
                        </span>
                        <Button onClick={handleSubmit} disabled={assignMutation.isPending || selectedIds.size === 0}>
                            {assignMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Asignar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
