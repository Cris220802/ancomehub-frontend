import { useState } from "react";
import { useProducts } from "../../products/hooks/useProducts";
import { ProductCard } from "../components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { PromotionalBanner } from "./components/PromotionalBanner";
import { ProductFiltersSidebar } from "./components/ProductFiltersSidebar";
import { Button } from "@/components/ui/Button";
import { Filter, PackageOpen } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export const CatalogPage = () => {
    const { products, isLoading, filters, setFilters, meta } = useProducts();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
            <PromotionalBanner />

            <div className="flex flex-col lg:flex-row gap-8 mt-8">
                {/* Mobile Filter Trigger */}
                <div className="lg:hidden flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Catálogo</h2>
                    <Button variant="outline" onClick={() => setIsSidebarOpen(true)}>
                        <Filter className="mr-2 h-4 w-4" /> Filtros
                    </Button>
                </div>

                {/* Sidebar */}
                <ProductFiltersSidebar
                    filters={filters}
                    setFilters={setFilters}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    className="w-full lg:w-64 shrink-0"
                />

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header & Meta */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground hidden lg:block">Catálogo de Productos</h1>
                            <p className="text-muted-foreground mt-1 hidden lg:block">
                                Personalización y seguridad para tu equipo.
                            </p>
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                            {isLoading ? (
                                <Skeleton className="h-5 w-32" />
                            ) : (
                                <span>Mostrando {meta?.total || 0} productos</span>
                            )}
                        </div>
                    </div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
                                    <Skeleton className="h-48 w-full rounded-lg" />
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <div className="flex justify-between pt-4">
                                        <Skeleton className="h-8 w-20" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed bg-slate-50/50">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <PackageOpen className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">No se encontraron productos</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                Intenta ajustar los filtros de búsqueda para encontrar lo que necesitas.
                            </p>
                            <Button
                                variant="link"
                                className="mt-4 text-primary"
                                onClick={() => setFilters({ limit: 10, page: 1 })}
                            >
                                Limpiar todos los filtros
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {meta && meta.lastPage > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                                            className={filters.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map((page) => (
                                        // Logic to show a window of pages can be added here, currently showing all or simple slice
                                        (page === 1 || page === meta.lastPage || (page >= (filters.page || 1) - 1 && page <= (filters.page || 1) + 1)) ? (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    isActive={page === (filters.page || 1)}
                                                    onClick={() => setFilters({ ...filters, page })}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ) : (
                                            (page === 2 && (filters.page || 1) > 3) || (page === meta.lastPage - 1 && (filters.page || 1) < meta.lastPage - 2) ? (
                                                <PaginationItem key={page}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            ) : null
                                        )
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setFilters({ ...filters, page: Math.min(meta.lastPage, (filters.page || 1) + 1) })}
                                            className={filters.page === meta.lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
