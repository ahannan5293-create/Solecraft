'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Star, Plus } from 'lucide-react';
import { useQuickView } from '@/components/product/QuickViewContext';
import { useWishlist } from '@/components/wishlist/WishlistContext';
import { Product } from '@/lib/products/map-product';
import { formatPrice } from '@/lib/format';

export default function ProductCard({ product, index }: { product: Product, index: number }) {
  const { openQuickView } = useQuickView();
  const { productIds, toggle } = useWishlist();
  
  const isWishlist = productIds.has(product.id);

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const getBadgeColor = (badge: string) => {
    if (badge.startsWith('-') || badge === 'sale') return 'bg-red-500';
    if (badge === 'bestseller') return 'bg-[#0f0f1a]';
    return 'bg-[#6C5CE7]';
  };

  const roundedRating = Math.floor(product.rating || 0);

  const displayImage = product.images?.[0]?.url || '/assets/images/shop/sneaker.png';

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-100 p-4 transition-all hover:shadow-lg hover:-translate-y-1 relative group cursor-pointer"
      onClick={handleOpenQuickView}
    >
      
      {/* Top row: Badge & Wishlist */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        {product.badge ? (
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wide ${getBadgeColor(product.badge)}`}>
            {product.badge}
          </div>
        ) : (
          <div /> // placeholder for spacing
        )}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform hover:scale-110 border border-gray-100"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${isWishlist ? 'fill-[#6C5CE7] text-[#6C5CE7]' : 'text-gray-400'}`} 
            strokeWidth={2} 
          />
        </button>
      </div>

      {/* Image */}
      <div className="w-full aspect-square relative mb-4 rounded-xl overflow-hidden bg-[#f7f8fb] flex items-center justify-center">
        <div className="relative w-[85%] h-[85%]">
          <Image 
            src={displayImage}
            alt={product.images?.[0]?.altText || product.name}
            fill
            className="object-contain drop-shadow-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleOpenQuickView}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md bg-[#0f0f1a] text-white hover:scale-110"
          aria-label="Quick View"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1 capitalize">{product.category}</span>
        <h3 className="font-semibold text-[#0f0f1a] mb-2">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-[#0f0f1a]">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-auto">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`w-3.5 h-3.5 ${i < roundedRating ? 'fill-[#6C5CE7] text-[#6C5CE7]' : 'fill-transparent text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">({(product.rating || 0).toFixed(1)})</span>
        </div>
      </div>
      
    </div>
  );
}
