import { useState } from "react";
import { X, Tag, Store, ExternalLink, Image as ImageIcon, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getImageUrl, cn } from "@/lib/utils";
import { CatalogProduct } from "@/types/products";
import { AgentCatalogResponseDto } from "@/types/users";

interface ProductDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: CatalogProduct | null;
    agent: AgentCatalogResponseDto | null;
}

export const ProductDetailDialog = ({ isOpen, onOpenChange, product, agent }: ProductDetailDialogProps) => {
    const [viewMode, setViewMode] = useState<'image' | 'pdf'>('image');

    const handleOpenChange = (open: boolean) => {
        if (!open) setViewMode('image'); // Reset formatting on close
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-[95vw] md:max-w-7xl h-[90vh] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-xl bg-white flex flex-col md:flex-row">
                <button onClick={() => handleOpenChange(false)} className="absolute right-4 top-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200/50 transition-all shadow-sm">
                    <X className="h-5 w-5" />
                </button>
                <div className="w-full md:w-[60%] bg-gray-100 flex flex-col relative h-[40vh] md:h-full">
                    <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
                        {product && (
                            <>
                                {viewMode === 'image' ? (
                                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="relative z-10 max-w-[85%] max-h-[85%] object-contain mix-blend-multiply drop-shadow-2xl animate-in zoom-in-95 duration-300" />
                                ) : (
                                    <iframe src={getImageUrl(product.datasheetUrl)} className="w-full h-full relative z-10 bg-white" title="Ficha Técnica" />
                                )}
                            </>
                        )}
                    </div>
                    {product?.datasheetUrl && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex bg-white/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-gray-200/50">
                            <button onClick={() => setViewMode('image')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all", viewMode === 'image' ? "bg-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-100")}>
                                <ImageIcon className="h-3.5 w-3.5" /> Producto
                            </button>
                            <button onClick={() => setViewMode('pdf')} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all", viewMode === 'pdf' ? "bg-red-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100")}>
                                <FileText className="h-3.5 w-3.5" /> Ficha Técnica
                            </button>
                        </div>
                    )}
                </div>
                <div className="w-full md:w-[40%] flex flex-col bg-white h-[60vh] md:h-full border-l border-gray-100 relative">
                    <ScrollArea className="flex-1">
                        <div className="p-6 md:p-10 space-y-8">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wide text-[10px] px-2 py-0.5 rounded-sm">{product?.category.name}</Badge>
                                    <span className="text-xs text-muted-foreground font-mono bg-gray-50 px-2 py-0.5 rounded text-[10px]">SKU: {product?.id.split('-')[0].toUpperCase()}</span>
                                </div>
                                <DialogTitle className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">{product?.name}</DialogTitle>
                            </div>
                            <Separator />
                            <div className="prose prose-sm text-gray-600">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3"><Tag className="h-4 w-4 text-primary" /> Descripción Detallada</h4>
                                <p className="leading-relaxed whitespace-pre-wrap text-sm text-gray-600 text-justify">{product?.description || "Sin descripción disponible."}</p>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                            <div className="bg-white p-2 rounded-full h-fit shadow-sm shrink-0"><Store className="h-5 w-5 text-blue-600" /></div>
                            <div>
                                <h5 className="text-sm font-bold text-blue-900">¿Interesado en este producto?</h5>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">Contacta a tu agente <strong>{agent?.fullName || "asignado"}</strong>.</p>
                            </div>
                        </div>
                        {product?.datasheetUrl && viewMode === 'pdf' && (
                            <Button variant="outline" className="w-full h-10 text-xs border-gray-300 text-gray-600 hover:bg-white" onClick={() => window.open(getImageUrl(product.datasheetUrl), '_blank')}>
                                <ExternalLink className="h-3.5 w-3.5 mr-2" /> Abrir PDF en nueva pestaña
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
