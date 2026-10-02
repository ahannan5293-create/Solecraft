'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '@/lib/products/map-product';

export default function ProductGrid({ products, totalCount }: { products: Product[], totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'Most Popular';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex-1 w-full">
      
      {/* Grid Header */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-gray-500 font-medium text-sm">{totalCount} Product{totalCount !== 1 ? 's' : ''}</span>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Sort by:</span>
          <div className="relative">
            <select 
              value={currentSort}
              onChange={handleSortChange}
              className="appearance-none bg-white border border-gray-200 text-[#0f0f1a] font-semibold text-sm py-2 pl-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] cursor-pointer"
            >
              <option value="Most Popular">Most Popular</option>
              <option value="Newest">Newest</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No products found matching your filters.
          </div>
        )}
      </div>

    </div>
  );
}
