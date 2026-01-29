import { CatalogProduct, Product } from '@/types/products';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, PackageCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/pages/client/hooks/useCart';

interface ProductCardDisplayProps {
    product: Product | CatalogProduct;
    isInCart?: boolean;
    quantity?: number;
    isUpdating?: boolean;
    onAddToCart?: (params: { productId: string; quantity: number }) => void;
    showActions?: boolean;
}

export const ProductCardDisplay = ({
    product,
    isInCart = false,
    quantity = 0,
    isUpdating = false,
    onAddToCart,
    showActions = true
}: ProductCardDisplayProps) => {

    // Helper to check if it is a full Product (has fields like stock, price)
    const isFullProduct = (p: Product | CatalogProduct): p is Product => {
        return 'stock' in p && 'basePrice' in p;
    };

    return (
        <div className="group relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

            {/* Header: Imagen con fondo sutil */}
            {/* Si estamos en catálogo público, quizás queramos abrir el modal en lugar de un link (o controlarlo desde fuera) 
                Por ahora mantengo el Link si es private, pero el usuario pidió modal en publico.
                El Link 'to' dependerá del contexto, pero aquí está hardcodeado.
                Mejor: El contenedor padre debe manejar el click si es público.
                Para no romper mucho, si showActions es false (público), desactivamos el Link o lo cambiamos?
                El usuario dijo: "Detalle de Producto: Al hacer clic en un producto, abre un Dialog".
                Entonces el Link aquí estorba para el caso público.
            */}
            <div className="block relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer">
                {/* Envolvemos en Link solo si showActions (indica modo cliente) */}
                {showActions ? (
                    <Link to={`/product/${product.id}`} className="block w-full h-full">
                        <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    </Link>
                ) : (
                    <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                )}
            </div>

            {/* Cuerpo */}
            <div className="flex-1 p-5 flex flex-col">

                {/* SKU y Estado */}
                {isFullProduct(product) && (
                    <div className="flex items-start justify-between mb-3">
                        <div className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="text-[10px] font-mono font-medium tracking-wider">SKU: {product.sku}</span>
                        </div>
                    </div>
                )}
                {!isFullProduct(product) && (
                    <div className="flex items-start justify-between mb-3">
                        <div className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="text-[10px] font-mono font-medium tracking-wider">{product.category.name}</span>
                        </div>
                    </div>
                )}

                {/* Título */}
                <div className="group-hover:text-primary transition-colors mb-2 cursor-pointer">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]" title={product.name}>
                        {product.name}
                    </h3>
                </div>

                {/* Disponibilidad (Solo si es full product) */}
                {isFullProduct(product) && (
                    <div className="mb-4">
                        {product.stock > 0 ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                                <PackageCheck className="h-4 w-4" />
                                <span className="text-xs font-semibold">Entrega Inmediata</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-orange-600">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs font-semibold">Sobre Pedido</span>
                                </div>
                                <span className="text-[10px] text-gray-500 ml-6">
                                    Estimado: {product.leadTimeDays} días hábiles
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Espaciador flexible */}
                <div className="flex-1"></div>

                {/* Footer: Precio y Botón - Solo si showActions (Client Mode) */}
                {showActions && isFullProduct(product) && (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Precio Unitario</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(product.basePrice)}
                                </span>
                                <span className="text-[10px] text-gray-500 font-normal">+ IVA</span>
                            </div>
                        </div>

                        {isInCart ? (
                            /* Controles de Cantidad (Placeholder visual) */
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 p-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-gray-600 hover:bg-white hover:shadow-sm">
                                    -
                                </Button>
                                <span className="text-sm font-semibold w-full text-center text-gray-900">{quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-gray-600 hover:bg-white hover:shadow-sm">
                                    +
                                </Button>
                            </div>
                        ) : (
                            /* Botón Agregar */
                            <Button
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm group-hover:shadow-md transition-all"
                                onClick={() => onAddToCart && onAddToCart({ productId: product.id, quantity: 1 })}
                                disabled={isUpdating}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {isUpdating ? 'Agregando...' : 'Agregar al Pedido'}
                            </Button>
                        )}
                    </div>
                )}

                {/* Footer para modo público: Ver Detalles */}
                {!showActions && (
                    <div className="pt-4 border-t border-gray-100">
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                            Ver Detalles
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart, isUpdating } = useCart();

    // Lógica placeholder 
    const isInCart = false;
    const quantity = 0;

    return (
        <ProductCardDisplay
            product={product}
            isInCart={isInCart}
            quantity={quantity}
            isUpdating={isUpdating}
            onAddToCart={addToCart}
            showActions={true}
        />
    );
};
