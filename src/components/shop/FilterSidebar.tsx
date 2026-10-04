'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface FilterSidebarProps {
  categories: { id: string, label: string, count: number }[];
  sizes: { id: string, label: string, count: number }[];
  colors: { id: string, name: string, hex: string }[];
  minPriceBound: number;
  maxPriceBound: number;
}

function FilterSection({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="py-6 border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center mb-4 text-[#0f0f1a] font-semibold text-sm hover:opacity-70 transition-opacity"
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="animate-in slide-in-from-top-2 fade-in duration-200">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ categories = [], sizes = [], colors = [], minPriceBound = 0, maxPriceBound = 0 }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';
  
  const sizesParam = searchParams.get('size');
  const activeSizes = sizesParam ? new Set(sizesParam.split(',')) : new Set<string>();

  const currentMinPrice = Number(searchParams.get('minPrice')) || minPriceBound;
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || maxPriceBound;
  
  const [localPriceRange, setLocalPriceRange] = useState(currentMaxPrice);

  useEffect(() => {
    setLocalPriceRange(currentMaxPrice);
  }, [currentMaxPrice]);

  const activeColor = searchParams.get('color');

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  const setCategory = (id: string) => {
    router.push(`${pathname}?${createQueryString('category', id === 'all' ? '' : id)}`, { scroll: false });
  };

  const toggleSize = (id: string) => {
    const next = new Set(activeSizes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    
    router.push(`${pathname}?${createQueryString('size', Array.from(next).join(','))}`, { scroll: false });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPriceRange(Number(e.target.value));
  };

  const applyPriceFilter = () => {
    router.push(`${pathname}?${createQueryString('maxPrice', localPriceRange.toString())}`, { scroll: false });
  };

  const handleColorClick = (colorId: string) => {
    router.push(`${pathname}?${createQueryString('color', activeColor === colorId ? '' : colorId)}`, { scroll: false });
  };

  return (
    <aside className="w-full lg:w-[220px] shrink-0">
      <div className="mb-6">
        <h2 className="text-xs font-bold text-[#6C5CE7] tracking-widest uppercase mb-2">Filters</h2>
      </div>

      <FilterSection title="Category">
        <div className="flex flex-col gap-3">
          {categories.map(cat => (
            <label key={cat.id} onClick={(e) => { e.preventDefault(); setCategory(cat.id); }} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  activeCategory === cat.id ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-gray-300 bg-white group-hover:border-[#6C5CE7]'
                }`}>
                  {activeCategory === cat.id && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${activeCategory === cat.id ? 'text-[#0f0f1a] font-medium' : 'text-gray-500'}`}>{cat.label}</span>
              </div>
              <span className="text-xs text-gray-400">({cat.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-col gap-3">
          {sizes.map(size => (
            <label key={size.id} onClick={(e) => { e.preventDefault(); toggleSize(size.id); }} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  activeSizes.has(size.id) ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-gray-300 bg-white group-hover:border-[#6C5CE7]'
                }`}>
                  {activeSizes.has(size.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${activeSizes.has(size.id) ? 'text-[#0f0f1a] font-medium' : 'text-gray-500'}`}>{size.label}</span>
              </div>
              <span className="text-xs text-gray-400">({size.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="pt-2">
          {/* Custom Slider */}
          <div className="relative h-1 bg-gray-200 rounded-full mb-4">
            <div 
              className="absolute h-full bg-[#6C5CE7] rounded-full" 
              style={{ width: `${maxPriceBound > minPriceBound ? ((localPriceRange - minPriceBound) / (maxPriceBound - minPriceBound)) * 100 : 100}%` }}
            />
            <input 
              type="range" 
              min={minPriceBound} 
              max={maxPriceBound} 
              value={localPriceRange}
              onChange={handlePriceChange}
              onMouseUp={applyPriceFilter}
              onTouchEnd={applyPriceFilter}
              className="absolute top-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#6C5CE7] rounded-full pointer-events-none shadow-sm"
              style={{ left: `calc(${maxPriceBound > minPriceBound ? ((localPriceRange - minPriceBound) / (maxPriceBound - minPriceBound)) * 100 : 100}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
            <span>{formatPrice(minPriceBound)}</span>
            <span>{formatPrice(localPriceRange)}</span>
          </div>
        </div>
      </FilterSection>

      {colors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex gap-3 flex-wrap">
            {colors.map(color => (
              <button
                key={color.id}
                title={color.name}
                onClick={() => handleColorClick(color.id)}
                className={`w-6 h-6 rounded-full relative flex items-center justify-center transition-transform hover:scale-110`}
                style={{ backgroundColor: color.hex }}
              >
                {activeColor === color.id && (
                  <div className="absolute inset-[-4px] border-2 border-[#6C5CE7] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

    </aside>
  );
}
