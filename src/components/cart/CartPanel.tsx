'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from './CartContext';
import EmptyStateGraphics from '@/components/layout/EmptyStateGraphics';
import { formatPrice } from '@/lib/format';

export default function CartPanel() {
  const { 
    items, 
    isPanelOpen, 
    closePanel, 
    incrementQty, 
    decrementQty, 
    removeItem, 
    subtotal, 
    itemCount 
  } = useCart();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closePanel();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 transition-opacity" 
        onClick={closePanel} 
      />

      {/* Panel */}
      <div 
        ref={panelRef}
        className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0f0f1a]">
            Your Cart <span className="text-gray-400 font-medium text-sm ml-1">({itemCount} items)</span>
          </h2>
          <button 
            onClick={closePanel}
            className="p-2 -mr-2 text-gray-400 hover:text-[#0f0f1a] transition-colors rounded-full hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center relative">
              <div className="scale-75 -my-4">
                <EmptyStateGraphics />
              </div>
              <h3 className="text-lg font-semibold text-gray-400 mb-6 relative z-10">Your cart is empty</h3>
              <button 
                onClick={closePanel}
                className="bg-[#0f0f1a] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-transform hover:-translate-y-0.5 relative z-10"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 shrink-0 bg-[#f7f8fb] rounded-xl relative flex items-center justify-center p-2">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-center py-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-xs text-gray-500 block mb-0.5">
                          {item.category}{item.size ? ` · Size ${item.size}` : ''}
                        </span>
                        <h4 className="font-semibold text-[#0f0f1a] text-sm leading-tight">{item.name}</h4>
                      </div>
                      <span className="font-bold text-[#0f0f1a] text-sm">{formatPrice(item.price)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Stepper */}
                      <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button 
                          onClick={() => decrementQty(item.cartItemId)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#6C5CE7] hover:bg-white rounded-md transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-[#0f0f1a]">{item.quantity}</span>
                        <button 
                          onClick={() => incrementQty(item.cartItemId)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#6C5CE7] hover:bg-white rounded-md transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col items-end">
                        <button 
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-[#0f0f1a]">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">Shipping and taxes calculated at checkout</p>
            
            <Link 
              href="/checkout" 
              onClick={closePanel}
              className="block w-full bg-[#0f0f1a] text-white text-center px-6 py-4 rounded-xl font-semibold text-sm transition-transform hover:-translate-y-0.5 mb-4"
            >
              Checkout
            </Link>
            
            <button 
              onClick={closePanel}
              className="block w-full text-center text-sm font-semibold text-gray-500 hover:text-[#0f0f1a] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
