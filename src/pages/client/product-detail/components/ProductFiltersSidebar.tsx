import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterProductDto } from "@/types/products";
import { useCategories } from "@/pages/categories/hooks/useCategories";
import { X, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface ProductFiltersSidebarProps {
    filters: FilterProductDto;
    setFilters: (filters: FilterProductDto) => void;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    className?: string; // For desktop sticky positioning
}

export function ProductFiltersSidebar({
    filters,
    setFilters,
    isOpen,
    setIsOpen,
    className,
}: ProductFiltersSidebarProps) {
    const { categories } = useCategories();

    // Local state for immediate UI updates (debounce actual filter change)
    // const [priceRange, setPriceRange] = useState<[number, number]>([
    //     filters.minPrice || 0,
    //     filters.maxPrice || 10000,
    // ]);

    // const debouncedPriceRange = useDebounce(priceRange, 1000);

    // Sync debounce with parent filters
    useEffect(() => {
        setFilters({
            ...filters,
            // minPrice: debouncedPriceRange[0],
            // maxPrice: debouncedPriceRange[1],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCategoryChange = (categoryId: string | undefined) => {
        setFilters({ ...filters, categoryId });
    };

    const handleAvailabilityChange = (checked: boolean) => {
        setFilters({ ...filters, immediateDelivery: checked });
    };

    const clearFilters = () => {
        // setPriceRange([0, 10000]);
        setFilters({
            limit: filters.limit,
            page: 1,
            categoryId: undefined,
            // minPrice: undefined,
            // maxPrice: undefined,
            immediateDelivery: undefined,
        });
    };

    const renderFilterContent = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filtros</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-primary">
                    Limpiar
                </Button>
            </div>

            <Accordion type="multiple" defaultValue={["categories", "price", "availability"]} className="w-full">
                {/* Categories Section */}
                <AccordionItem value="categories">
                    <AccordionTrigger>Categorías</AccordionTrigger>
                    <AccordionContent>
                        <ScrollArea className="h-[200px] pr-4">
                            <div className="space-y-2">
                                <Button
                                    variant={!filters.categoryId ? "secondary" : "ghost"}
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => handleCategoryChange(undefined)}
                                >
                                    Todas las categorías
                                </Button>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        variant={filters.categoryId === cat.id ? "secondary" : "ghost"}
                                        size="sm"
                                        className="w-full justify-start truncate"
                                        onClick={() => handleCategoryChange(cat.id)}
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </AccordionContent>
                </AccordionItem>

                {/* Price Section */}
                {/* <AccordionItem value="price">
                    <AccordionTrigger>Precio</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2">
                            <Slider
                                defaultValue={[0, 10000]}
                                value={[priceRange[0], priceRange[1]]}
                                min={0}
                                max={50000} // Adjust max as needed
                                step={100}
                                onValueChange={(val) => setPriceRange([val[0], val[1]])}
                            />
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    className="h-8 text-sm"
                                    placeholder="Min"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    className="h-8 text-sm"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem> */}

                {/* Availability Section */}
                <AccordionItem value="availability">
                    <AccordionTrigger>Disponibilidad</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="immediate-delivery"
                                checked={filters.immediateDelivery || false}
                                onCheckedChange={handleAvailabilityChange}
                            />
                            <Label htmlFor="immediate-delivery">Entrega Inmediata</Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );


    return (
        <>
            {/* Mobile View handled by Sheet */}
            {isOpen !== undefined && setIsOpen !== undefined && (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                        <SheetHeader>
                            <SheetTitle>Filtros de Productos</SheetTitle>
                            <SheetDescription>Encuentra lo que buscas rápidamente.</SheetDescription>
                        </SheetHeader>
                        <div className="mt-4">
                            {renderFilterContent()}
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            {/* Desktop View */}
            <div className={cn("hidden lg:block", className)}>
                <div className="bg-card rounded-xl border p-6 sticky top-20 shadow-sm">
                    {renderFilterContent()}
                </div>
            </div>
        </>
    );
}
