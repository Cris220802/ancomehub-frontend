import { getImageUrl } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface ProductGalleryProps {
    imageUrl?: string;
    title: string;
}

export const ProductGallery = ({ imageUrl, title }: ProductGalleryProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-8 flex items-center justify-center aspect-square overflow-hidden shadow-sm">
            {imageUrl ? (
                <img
                    src={getImageUrl(imageUrl)}
                    alt={title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-300">
                    <ImageIcon className="h-24 w-24 mb-2" />
                    <span className="text-sm">Sin imagen disponible</span>
                </div>
            )}
        </div>
    );
};
