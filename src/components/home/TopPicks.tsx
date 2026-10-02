'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/products/map-product';
import { useWishlist } from '@/components/wishlist/WishlistContext';
import { useQuickView } from '@/components/product/QuickViewContext';
import { formatPrice } from '@/lib/format';

export default function TopPicks({ products }: { products: Product[] }) {
  const { toggle, productIds } = useWishlist();
  const { openQuickView } = useQuickView();

  return (
    <section className="w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-[#6C5CE7] tracking-widest font-bold text-[0.7rem] uppercase mb-2">
            Best Sellers
          </p>
          <h2 className="text-[#0f0f1a] font-extrabold text-4xl tracking-[-0.03em]">
            Top Picks
          </h2>
        </div>
        <button className="text-[#6C5CE7] text-sm font-semibold flex items-center gap-2 hover:text-[#5a4bd1] transition-colors group">
          View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => {
          const isWishlist = productIds.has(product.id);
          const displayImage = product.images?.[0]?.url || '/assets/images/shop/sneaker.png';

          return (
            <div 
              key={product.id} 
              onClick={() => openQuickView(product)}
              className="group cursor-pointer border border-gray-100 bg-white rounded-3xl p-6 transition-shadow hover:shadow-xl"
            >
              <div className="relative mb-6 aspect-[4/3] flex items-center justify-center">
                {product.badge && (
                  <div className={`absolute top-0 left-0 px-3 py-1 rounded-full text-[10px] font-bold text-white z-10 ${product.badge === 'bestseller' ? 'bg-[#0f0f1a]' : 'bg-[#6C5CE7]'}`}>
                    {product.badge}
                  </div>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
                  className="absolute top-0 right-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10 text-gray-400 hover:text-red-500"
                >
                  <Heart className={`w-5 h-5 transition-colors ${isWishlist ? 'fill-[#6C5CE7] text-[#6C5CE7]' : 'text-gray-400'}`} strokeWidth={1.5} />
                </button>
                <div className="relative w-[90%] h-[90%] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1 mt-4">
                  <Image 
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-md"
                  />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 font-medium capitalize">{product.category}</p>
                <h3 className="text-[#0f0f1a] font-bold text-lg mb-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-[#0f0f1a] text-lg">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through text-sm font-medium">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {product.colors?.map((color, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: color.hex }} title={color.name} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
