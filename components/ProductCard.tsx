// components/ProductCard.tsx
import Image from 'next/image';
import { product } from '@/types';

interface ProductCardProps {
    product: product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="bg-white rounded-xl shadow-md ...">
            <div className="relative h-48 w-full bg-gray-200">
                {/* تعديل Image و Name هنا */}
                {product.Image ? (
                    <Image
                        src={product.Image}
                        alt={product.Name}
                        fill
                        className="object-cover"
                        sizes="..."
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                    </div>
                )}
            </div>

            <div className="p-4">
                {/* تعديل Name هنا */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                    {product.Name}
                </h3>

                {/* تعديل Description هنا */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {product.Description}
                </p>

                <div className="flex justify-between items-center">
                    {/* تعديل Price هنا */}
                    <span className="text-orange-600 font-bold text-xl">
                        ${product.Price}
                    </span>
                    <button className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};