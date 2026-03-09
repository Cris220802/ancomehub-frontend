import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAdminWeakClient } from "@/pages/admin/hooks/useAdminWeakClient";
import { useDebounce } from "@/hooks/useDebounce";

interface WeakClientSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function WeakClientSelect({ value, onChange, disabled }: WeakClientSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(1);
    const limit = 10;

    const { useWeakClients, useWeakClientDetail } = useAdminWeakClient();

    const { data, isLoading, isFetching } = useWeakClients({
        name: debouncedSearch,
        page,
        limit,
    });

    // Load the selected client's detail to display its name when the popover is closed and we have a value
    const { data: selectedClient } = useWeakClientDetail(value);

    const clients = data?.items || [];
    const meta = data?.meta;

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setSearchTerm("");
            setPage(1);
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}
                    disabled={disabled}
                >
                    {selectedClient ? selectedClient.name : "Seleccione un cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar por Nombre / Razón Social..."
                        value={searchTerm}
                        onValueChange={(val) => {
                            setSearchTerm(val);
                            setPage(1);
                        }}
                    />
                    <CommandList>
                        {isLoading && (
                            <div className="p-4 flex justify-center">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!isLoading && clients.length === 0 && <CommandEmpty>No se encontraron clientes.</CommandEmpty>}
                        {!isLoading && clients.length > 0 && (
                            <CommandGroup>
                                {clients.map((client) => (
                                    <CommandItem
                                        key={client.id}
                                        value={client.id}
                                        onSelect={() => {
                                            onChange(client.id);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === client.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {client.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {meta && page < meta.lastPage && (
                            <div className="p-2 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(p => p + 1);
                                    }}
                                    disabled={isFetching}
                                >
                                    {isFetching ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Cargar más"}
                                </Button>
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
