'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useQuickView } from './QuickViewContext';
import { useCart } from '../cart/CartContext';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';

export default function QuickViewModal() {
  const { isOpen, activeProduct, closeQuickView } = useQuickView();
  const { openPanel } = useCart();
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeQuickView();
    }
  };

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

        <ProductGallery key={`gallery-${activeProduct.id}`} product={activeProduct} images={images} />
        
        <ProductInfo 
          key={`info-${activeProduct.id}`} 
          product={activeProduct} 
          images={images} 
          onAddToCart={() => {
            closeQuickView();
            openPanel();
          }} 
        />
      </div>
    </div>
  );
}
