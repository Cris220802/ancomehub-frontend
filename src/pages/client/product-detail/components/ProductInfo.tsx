import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/products';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, FileText, Minus, Plus, ChevronRight, Clock } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useCart } from '@/pages/client/hooks/useCart';
// Duplicate import removed

interface ProductInfoProps {
    product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart, isUpdating } = useCart();

    const handleQuantityChange = (val: string) => {
        const num = parseInt(val);
        if (!isNaN(num) && num > 0) {
            setQuantity(num);
        } else if (val === '') {
            setQuantity(1); // Default to 1 if cleared, or handle as empty string if preferred
        }
    };

    const handleViewDatasheet = () => {
        window.open(getImageUrl(product.datasheetUrl), '_blank');
    };

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            quantity: quantity,
        });
    };

    return (
        <div className="flex flex-col space-y-6">

            <div className="space-y-4">
                {/* Header Info */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                        {product.name}
                    </h1>
                    <div className="mt-2 flex items-center gap-4">
                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            SKU: {product.sku}
                        </span>
                        {product.stock > 0 ? (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
                                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                Entrega Inmediata
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100">
                                <div className="flex items-center gap-2 text-orange-600">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs font-semibold">Sobre Pedido</span>
                                </div>
                                <span className="text-[10px] text-gray-500 ml-6">
                                    Estimado: {product.leadTimeDays} días hábiles
                                </span>
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Price */}
                <div className="border-t border-b border-gray-100 py-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(product.basePrice)}
                        </span>
                        <span className="text-sm text-gray-500 font-normal">MXN + IVA</span>
                    </div>
                </div>

                {/* Description */}
                <div className="prose prose-sm text-gray-600">
                    <p>{product.description || "Sin descripción técnica disponible para este producto."}</p>
                </div>

                {/* Actions Section */}
                <div className="pt-4 space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                        <div className="flex items-center border border-gray-300 rounded-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none rounded-l-md hover:bg-gray-100"
                                onClick={decrement}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                                type="number"
                                min="1"
                                className="h-9 w-16 border-0 text-center focus-visible:ring-0 rounded-none px-0"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none rounded-r-md hover:bg-gray-100"
                                onClick={increment}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="flex-1 bg-primary hover:bg-primary/90 text-white h-11 text-base shadow-sm"
                            onClick={handleAddToCart}
                            disabled={isUpdating}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {isUpdating ? 'Agregando...' : 'Agregar al Pedido'}
                        </Button>

                        {product.datasheetUrl && (
                            <Button onClick={handleViewDatasheet} variant="outline" className="flex-1 border-gray-300 text-gray-700 h-11 hover:bg-gray-50 hover:text-primary hover:border-primary">
                                <FileText className="mr-2 h-5 w-5" />
                                Ficha Técnica
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
