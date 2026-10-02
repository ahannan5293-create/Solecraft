'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/lib/format';

const categories = [
  { id: 'all', label: 'All', count: 48 },
  { id: 'men', label: 'Men', count: 24 },
  { id: 'women', label: 'Women', count: 14 },
  { id: 'kids', label: 'Kids', count: 6 },
  { id: 'limited', label: 'Limited Edition', count: 4 },
  { id: 'new', label: 'New Arrivals', count: 10 },
];

const sizes = [
  { id: 'us6', label: 'US 6', count: 8 },
  { id: 'us7', label: 'US 7', count: 12 },
  { id: 'us8', label: 'US 8', count: 15 },
  { id: 'us9', label: 'US 9', count: 14 },
  { id: 'us10', label: 'US 10', count: 10 },
  { id: 'us11', label: 'US 11', count: 7 },
  { id: 'us12', label: 'US 12', count: 4 },
];

const colors = [
  { id: 'purple', bg: 'bg-[#6C5CE7]' },
  { id: 'black', bg: 'bg-[#171717]' },
  { id: 'gray', bg: 'bg-gray-500' },
  { id: 'lightgray', bg: 'bg-gray-300' },
  { id: 'pink', bg: 'bg-pink-300' },
  { id: 'blue', bg: 'bg-blue-400' },
];

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

export default function FilterSidebar() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['all']));
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<number>(200);
  const [selectedColor, setSelectedColor] = useState<string>('purple');

  const toggleCategory = (id: string) => {
    const next = new Set(selectedCategories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCategories(next);
  };

  const toggleSize = (id: string) => {
    const next = new Set(selectedSizes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSizes(next);
  };

  return (
    <aside className="w-full lg:w-[220px] shrink-0">
      <div className="mb-6">
        <h2 className="text-xs font-bold text-[#6C5CE7] tracking-widest uppercase mb-2">Filters</h2>
      </div>

      <FilterSection title="Category">
        <div className="flex flex-col gap-3">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  selectedCategories.has(cat.id) ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-gray-300 bg-white group-hover:border-[#6C5CE7]'
                }`}>
                  {selectedCategories.has(cat.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${selectedCategories.has(cat.id) ? 'text-[#0f0f1a] font-medium' : 'text-gray-500'}`}>{cat.label}</span>
              </div>
              <span className="text-xs text-gray-400">({cat.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-col gap-3">
          {sizes.map(size => (
            <label key={size.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  selectedSizes.has(size.id) ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-gray-300 bg-white group-hover:border-[#6C5CE7]'
                }`}>
                  {selectedSizes.has(size.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${selectedSizes.has(size.id) ? 'text-[#0f0f1a] font-medium' : 'text-gray-500'}`}>{size.label}</span>
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
              style={{ width: `${((priceRange - 50) / 150) * 100}%` }}
            />
            <input 
              type="range" 
              min="50" 
              max="200" 
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="absolute top-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#6C5CE7] rounded-full pointer-events-none shadow-sm"
              style={{ left: `calc(${((priceRange - 50) / 150) * 100}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
            <span>{formatPrice(50)}</span>
            <span>{formatPrice(priceRange)}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex gap-3">
          {colors.map(color => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className={`w-6 h-6 rounded-full relative flex items-center justify-center transition-transform hover:scale-110 ${color.bg}`}
            >
              {selectedColor === color.id && (
                <div className="absolute inset-[-4px] border-2 border-[#6C5CE7] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

    </aside>
  );
}
