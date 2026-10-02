'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/lib/products/map-product';

interface QuickViewContextValue {
  activeProduct: Product | null;
  isOpen: boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | undefined>(undefined);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = (product: Product) => {
    setActiveProduct(product);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
  };

  return (
    <QuickViewContext.Provider value={{ activeProduct, isOpen, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (context === undefined) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}
