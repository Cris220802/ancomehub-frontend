import { ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import { CatalogProduct } from "@/types/products";

interface CatalogProductCardProps {
    product: CatalogProduct;
    onClick: () => void;
}

export const CatalogProductCard = ({ product, onClick }: CatalogProductCardProps) => (
    <div
        onClick={onClick}
        className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
    >
        <div className="aspect-square bg-white relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gray-50/50 group-hover:bg-gray-50 transition-colors" />
            <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out relative z-10"
                loading="lazy"
            />
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[10px] shadow-sm border border-gray-100 text-gray-700">
                    {product.category.name}
                </Badge>
            </div>
            <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/5 pointer-events-none">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="bg-white text-gray-900 shadow-lg font-medium text-xs py-2 px-4 rounded-full flex items-center gap-2">
                        <Eye className="h-3 w-3" /> Vista Rápida
                    </span>
                </div>
            </div>
        </div>
        <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 mt-1 flex-1">
                {product.description}
            </p>
            <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-primary transition-colors">
                    Ver Detalles
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
        </div>
    </div>
);
