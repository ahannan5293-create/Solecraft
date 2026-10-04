'use client';

import React, { useState } from 'react';
import { Star, Heart, Minus, Plus } from 'lucide-react';
import { Product } from '@/lib/products/map-product';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { formatPrice } from '@/lib/format';

export default function ProductInfo({ product, images, onAddToCart }: { product: Product, images: string[], onAddToCart?: () => void }) {
  const { addItem, openPanel } = useCart();
  const { productIds, toggle } = useWishlist();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);

  const isWishlist = productIds.has(product.id);
  const roundedRating = Math.floor(product.rating || 0);

  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes.map(s => s.size)
    : ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'];
    
  const description = product.description || "The ultimate everyday shoe, combining advanced cushioning technology with a sleek, minimalist design that works perfectly for both active days and casual styling.";

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      category: product.category,
      quantity,
      size: selectedSize
    });
    
    if (onAddToCart) onAddToCart();
    else openPanel();
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col p-6 md:p-10 overflow-y-auto">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm font-semibold text-[#6C5CE7] tracking-wider uppercase mb-2 block">
            {product.category}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f0f1a] leading-tight">
            {product.name}
          </h2>
        </div>
        <button 
          onClick={() => toggle(product.id)}
          className="w-10 h-10 shrink-0 rounded-full bg-gray-50 flex items-center justify-center transition-transform hover:scale-110"
        >
          <Heart className={`w-5 h-5 transition-colors ${isWishlist ? 'fill-[#6C5CE7] text-[#6C5CE7]' : 'text-gray-400'}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              className={`w-4 h-4 ${i < roundedRating ? 'fill-[#6C5CE7] text-[#6C5CE7]' : 'fill-transparent text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 font-medium">({product.reviewCount || 128} reviews)</span>
      </div>

      <div className="flex items-end gap-3 mb-6">
        <span className="text-3xl font-extrabold text-[#0f0f1a]">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(product.originalPrice)}</span>
        )}
      </div>

      <p className="text-gray-500 leading-relaxed mb-8">
        {description}
      </p>

      {/* Size Selector */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-[#0f0f1a]">Size</span>
          <button className="text-sm text-gray-400 underline hover:text-[#0f0f1a]">Size Guide</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => { setSelectedSize(size); setShowSizeError(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                selectedSize === size 
                  ? 'border-[#0f0f1a] bg-[#0f0f1a] text-white' 
                  : 'border-gray-100 text-gray-600 hover:border-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {showSizeError && (
          <p className="text-red-500 text-sm font-medium mt-2 animate-pulse">Please select a size</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 flex gap-4">
        {/* Quantity Stepper */}
        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 shrink-0">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0f0f1a] hover:bg-white rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center text-base font-bold text-[#0f0f1a]">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0f0f1a] hover:bg-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart */}
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-[#0f0f1a] text-white rounded-xl font-bold transition-transform hover:-translate-y-0.5"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
