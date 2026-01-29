import { useParams, Link } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProductDetail';
import { ProductGallery } from './components/ProductGallery';
import { ProductInfo } from './components/ProductInfo';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, AlertCircle, ChevronRight, Home, Package } from 'lucide-react';

export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { product, isLoading, isError } = useProductDetail(id || '');

    // --- Loading State Mejorado ---
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb Skeleton */}
                <div className="flex items-center gap-2 mb-8">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                    {/* Gallery Skeleton */}
                    <Skeleton className="aspect-square w-full rounded-xl bg-gray-100" />

                    {/* Info Skeleton */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
                        <Skeleton className="h-8 w-3/4" />
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-12 w-1/3" />
                        <div className="space-y-2 pt-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="pt-8 flex gap-4">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (isError || !product) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50/50">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Producto no disponible</h2>
                <p className="text-gray-500 mb-8 max-w-md text-lg">
                    El producto que buscas no existe en nuestro catálogo actual o ha sido descontinuado.
                </p>
                <Link to="/">
                    <Button size="lg" className="gap-2 shadow-md">
                        <ArrowLeft className="h-5 w-5" />
                        Regresar al Catálogo
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* 1. Navegación Superior (Breadcrumbs & Back) */}
                <nav className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span className="hidden sm:inline">Catalogo de Productos</span>
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
                        <span className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                            {product.name}
                        </span>
                    </div>

                    <Link to="/">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gray-900 hidden sm:flex">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </nav>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">

                    {/* 2. Columna Izquierda: Galería */}
                    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                        <ProductGallery imageUrl={product.imageUrl} title={product.name} />

                        {/* Sección opcional: Detalles técnicos extra bajo la imagen (común en B2B) */}
                        <div className="mt-8 hidden lg:block p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-4">Detalles Técnicos Rápidos</h4>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                <div>
                                    <dt className="text-gray-500">Tiempo de Entrega</dt>
                                    <dd className="font-medium text-gray-900">{product.leadTimeDays} días hábiles</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Categoría</dt>
                                    <dd className="font-medium text-gray-900">{product.category?.name || 'General'}</dd>
                                </div>
                                {/* Aquí podrías mapear más specs si las tuvieras en el backend */}
                            </dl>
                        </div>
                    </div>

                    {/* 3. Columna Derecha: Información de Compra */}
                    {/* 'lg:sticky lg:top-24' hace que este panel te siga al scrollear */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                        <ProductInfo product={product} />

                        {/* Mobile Only: Back button at bottom if user scrolled all the way down */}
                        <div className="mt-12 lg:hidden border-t pt-6">
                            <Link to="/">
                                <Button variant="outline" className="w-full">
                                    Ver más productos
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};