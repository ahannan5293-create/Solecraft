'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { X, Star, Heart, Minus, Plus } from 'lucide-react';
import { useQuickView } from './QuickViewContext';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { formatPrice } from '@/lib/format';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false });

export default function QuickViewModal() {
  const { isOpen, activeProduct, closeQuickView } = useQuickView();
  const { addItem, openPanel } = useCart();
  const { productIds, toggle } = useWishlist();
  
  const [activeTab, setActiveTab] = useState<'images' | '3d'>('images');
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);

  const isWishlist = activeProduct ? productIds.has(activeProduct.id) : false;

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when a new product opens
  useEffect(() => {
    if (isOpen && activeProduct) {
      setActiveTab('images');
      setMainImageIndex(0);
      setSelectedSize('');
      setQuantity(1);
      setShowSizeError(false);
    }
  }, [isOpen, activeProduct]);

  // Lock body scroll and handle escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeQuickView();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, closeQuickView]);

  if (!isOpen || !activeProduct) return null;

  const images = activeProduct.images && activeProduct.images.length > 0 
    ? activeProduct.images.map(img => img.url) 
    : ['/assets/images/shop/sneaker.png'];
    
  const sizes = activeProduct.sizes && activeProduct.sizes.length > 0
    ? activeProduct.sizes.map(s => s.size)
    : ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'];
    
  const description = activeProduct.description || "The ultimate everyday shoe, combining advanced cushioning technology with a sleek, minimalist design that works perfectly for both active days and casual styling.";

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }
    
    addItem({
      id: activeProduct.id,
      name: activeProduct.name,
      price: activeProduct.price,
      image: images[0],
      category: activeProduct.category,
      quantity,
      size: selectedSize
    });
    
    closeQuickView();
    openPanel();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeQuickView();
    }
  };

  const roundedRating = Math.floor(activeProduct.rating || 0);

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6"
      role="dialog" 
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={handleBackdropClick}
      />

      {/* Modal Card */}
      <div 
        ref={modalRef}
        className="relative bg-white w-full max-w-[960px] max-h-[90vh] md:max-h-[85vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button 
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-[#0f0f1a] hover:bg-gray-100 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Media */}
        <div className="w-full md:w-1/2 bg-[#f7f8fb] flex flex-col relative shrink-0">
          {/* Tab Toggle (if 3D exists) */}
          {activeProduct.model3dUrl && (
            <div className="absolute top-6 left-6 z-10 flex bg-white/80 backdrop-blur-md rounded-full p-1 shadow-sm">
              <button 
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${activeTab === 'images' ? 'bg-[#0f0f1a] text-white' : 'text-gray-500 hover:text-[#0f0f1a]'}`}
                onClick={() => setActiveTab('images')}
              >
                Images
              </button>
              <button 
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${activeTab === '3d' ? 'bg-[#0f0f1a] text-white' : 'text-gray-500 hover:text-[#0f0f1a]'}`}
                onClick={() => setActiveTab('3d')}
              >
                3D View
              </button>
            </div>
          )}

          {/* Media Content */}
          <div className="flex-1 w-full h-[300px] md:h-auto relative flex items-center justify-center p-8">
            {activeTab === '3d' && activeProduct.model3dUrl ? (
              <ModelViewer src={activeProduct.model3dUrl} />
            ) : (
              <div 
                className="relative w-full h-full max-w-[80%] max-h-[80%] drop-shadow-2xl"
              >
                <Image 
                  src={images[mainImageIndex]} 
                  alt={activeProduct.name} 
                  fill 
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            )}
          </div>

          {/* Thumbnails (only for images tab) */}
          {activeTab === 'images' && (
            <div className="flex justify-center gap-3 p-4 bg-white/50 backdrop-blur-sm">
              {images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setMainImageIndex(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm border-2 transition-all ${mainImageIndex === i ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/20' : 'border-transparent hover:border-gray-300'}`}
                >
                  <div 
                    className="absolute inset-0 w-full h-full p-2"
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-contain p-2" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-10 overflow-y-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-sm font-semibold text-[#6C5CE7] tracking-wider uppercase mb-2 block">
                {activeProduct.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f0f1a] leading-tight">
                {activeProduct.name}
              </h2>
            </div>
            <button 
              onClick={() => activeProduct && toggle(activeProduct.id)}
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
            <span className="text-sm text-gray-500 font-medium">({activeProduct.reviewCount || 128} reviews)</span>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-extrabold text-[#0f0f1a]">{formatPrice(activeProduct.price)}</span>
            {activeProduct.originalPrice && (
              <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(activeProduct.originalPrice)}</span>
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
      </div>
    </div>
  );
}
