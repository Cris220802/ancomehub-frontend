import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Store, Phone, Mail, Search, Filter, PackageOpen, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomPagination } from "@/components/common/CustomPagination";

import { ProductsService } from "@/services/products.service";
import { UsersService } from "@/services/users.service";
import { useCategories } from "@/pages/categories/hooks/useCategories";

import { CatalogProduct, PaginationMeta } from "@/types/products";
import { AgentCatalogResponseDto } from "@/types/users";

// Components
import { MainBannerSlider } from "./components/MainBannerSlider";
import { InGridBanner } from "./components/InGridBanner";
import { AncomeHubPromo } from "./components/AncomeHubPromo";
import { AgentCard } from "./components/AgentCard";
import { CatalogProductCard } from "./components/CatalogProductCard";
import { CategoryList } from "./components/CategoryList";
import { ProductDetailDialog } from "./components/ProductDetailDialog";
import { cn } from "@/lib/utils";
import logoAncome from "@/assets/LogoAncome.png";
export const CatalogPage = () => {
    const { agentId } = useParams();
    const [agent, setAgent] = useState<AgentCatalogResponseDto | null>(null);

    const [products, setProducts] = useState<CatalogProduct[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);

    const { categories, isLoading: isLoadingCategories } = useCategories();

    useEffect(() => {
        if (agentId) {
            UsersService.findOneAgentCatalog(agentId)
                .then(setAgent)
                .catch(() => toast.error("No se pudo cargar la información del agente"));
        }
    }, [agentId]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await ProductsService.findAllCatalog({
                    page,
                    limit: 12,
                    categoryId,
                    productName: search,
                });
                setProducts(data.items);
                setMeta(data.meta);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        const timeoutId = setTimeout(() => fetchProducts(), 500);
        return () => clearTimeout(timeoutId);
    }, [page, categoryId, search, agentId]);

    const handleProductClick = async (product: CatalogProduct) => {
        setSelectedProduct(product);
        setIsDetailOpen(true);
        try {
            const details = await ProductsService.findOneCatalog(product.id);
            setSelectedProduct(details);
        } catch (error) { }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans selection:bg-primary/20">

            {/* Header Sticky */}
            <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">

                        <img src={logoAncome} className="h-10" alt="" />

                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">Ancome <span className="text-primary">Hub</span></span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">Catálogo Digital</span>
                        </div>
                    </div>

                    {/* Mobile Header Agent Contact (SOLO MOVIL) */}
                    {agent && (
                        <div className="lg:hidden flex items-center gap-2 bg-gray-50 p-1 pr-2 rounded-full border border-gray-200">
                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
                                {agent.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col mr-1 max-w-[80px]">
                                <span className="text-[10px] font-bold text-gray-900 truncate leading-tight">{agent.fullName.split(' ')[0]}</span>
                                <span className="text-[8px] text-gray-500 leading-none">Asesor</span>
                            </div>
                            <div className="flex gap-1 border-l border-gray-200 pl-2">
                                {agent.phoneNumber && (
                                    <a href={`https://wa.me/${agent.phoneNumber.replace(/\D/g, '')}`} target="_blank" className="p-1.5 bg-green-100 text-green-700 rounded-full">
                                        <Phone className="h-3 w-3" />
                                    </a>
                                )}
                                <a href={`mailto:${agent.email}`} className="p-1.5 bg-blue-100 text-blue-700 rounded-full">
                                    <Mail className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-6 md:py-8">

                {/* Search Bar */}


                {/* --- SECCIÓN PRINCIPAL: AGENT CARD (Col-3) + SLIDER (Col-9) --- */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">

                    {/* COL-3: Agent Card (Solo Desktop) */}
                    {agent && (
                        <div className="hidden lg:block w-full lg:w-1/5 animate-in fade-in slide-in-from-left-4 duration-500">
                            <AgentCard agent={agent} />
                        </div>
                    )}

                    {/* COL-9: Slider Principal */}
                    <div className={cn("w-full", agent ? "lg:w-4/5" : "w-full")}>
                        <MainBannerSlider />
                    </div>
                </div>


                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* SIDEBAR (Filtros & Ancome Hub Promo) */}
                    <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 h-fit z-10">

                        {/* Mobile Filter Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full lg:hidden justify-between h-12 bg-white border-gray-200 mb-4 shadow-sm">
                                    <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filtros y Categorías</span>
                                    {categoryId && <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">1</Badge>}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[320px] sm:w-[400px] overflow-y-auto">
                                <SheetHeader className="mb-6 text-left">
                                    <SheetTitle>Menú</SheetTitle>
                                </SheetHeader>
                                {/* Mobile Agent Card fallback */}
                                {agent && <div className="mb-8 lg:hidden"><AgentCard agent={agent} /></div>}

                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Publicidad</h4>
                                    <AncomeHubPromo />
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Categorías</h4>
                                    <CategoryList categories={categories} selectedId={categoryId} onSelect={(id) => { setCategoryId(id); setPage(1); }} />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Desktop Filters & Ads */}
                        <div className="hidden lg:block space-y-6">
                            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3 px-2">
                                    <h3 className="font-semibold text-gray-900 text-sm">Categorías</h3>
                                    {categoryId && (
                                        <button onClick={() => setCategoryId(undefined)} className="text-[10px] text-red-500 hover:underline">Limpiar</button>
                                    )}
                                </div>
                                <ScrollArea className="h-[300px]">
                                    <CategoryList categories={categories} selectedId={categoryId} onSelect={(id) => { setCategoryId(id); setPage(1); }} />
                                </ScrollArea>
                            </div>

                            {/* ANCOME HUB PROMO CARD */}
                            <AncomeHubPromo />
                        </div>
                    </aside>

                    {/* PRODUCT GRID */}
                    <div className="flex-1 w-full">
                        <div className="relative max-w-2xl mx-auto mb-8">
                            <div className="relative z-10 shadow-sm hover:shadow-md transition-all duration-300 rounded-full bg-white border border-gray-200">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    className="pl-12 h-12 md:h-14 rounded-full border-none bg-transparent text-base focus-visible:ring-0"
                                    placeholder="Buscar productos..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="mb-6 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {isLoading ? <Skeleton className="h-4 w-24" /> : <span><strong>{meta?.total || 0}</strong> resultados</span>}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="h-32 w-full rounded-lg" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {products.map((product, index) => {
                                    const showBanner = index === 3;
                                    return (
                                        <div key={product.id} className="contents">
                                            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
                                                <CatalogProductCard product={product} onClick={() => handleProductClick(product)} />
                                            </div>
                                            {/* {showBanner && (
                                                <div className="col-span-2 md:col-span-3 xl:col-span-4 animate-in fade-in zoom-in-95 duration-700">
                                                    <InGridBanner />
                                                </div>
                                            )} */}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                                <PackageOpen className="h-10 w-10 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No se encontraron productos</p>
                                <Button variant="link" onClick={() => { setSearch(''); setCategoryId(undefined); }}>Limpiar filtros</Button>
                            </div>
                        )}

                        {!isLoading && meta && (
                            <div className="mt-10 flex justify-center">
                                <CustomPagination meta={meta as any} onPageChange={setPage} isLoading={isLoading} />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ProductDetailDialog
                isOpen={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                product={selectedProduct}
                agent={agent}
            />
        </div>
    );
};