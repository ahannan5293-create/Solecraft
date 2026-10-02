'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LayoutGrid, User, UserRound, Baby, Tag, Sparkles } from 'lucide-react';

const tabs = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'men', label: 'Men', icon: User },
  { id: 'women', label: 'Women', icon: UserRound },
  { id: 'kids', label: 'Kids', icon: Baby },
  { id: 'limited', label: 'Limited Edition', icon: Tag },
  { id: 'new', label: 'New Arrivals', icon: Sparkles },
];

export default function CategoryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('category') || 'all';

  const handleTabClick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'all') {
      params.delete('category');
    } else {
      params.set('category', id);
    }
    // Optional: reset page to 1 when filter changes
    params.delete('page');
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full border-t border-b border-gray-100 bg-white py-8">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-center lg:justify-between items-center overflow-x-auto no-scrollbar gap-8 lg:gap-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[120px] transition-all ${
                isActive ? 'bg-[#f4f2ff] rounded-2xl py-4 px-6' : 'hover:opacity-70'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                  isActive ? 'bg-white shadow-sm text-[#6C5CE7]' : 'bg-[#f7f8fb] text-gray-500'
                }`}
              >
                <Icon strokeWidth={1.5} className="w-6 h-6" />
              </div>
              <span className={`text-sm font-semibold mb-1 ${isActive ? 'text-[#0f0f1a]' : 'text-gray-700'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-6 h-1 bg-[#6C5CE7] rounded-full mt-3" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
