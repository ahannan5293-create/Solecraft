'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12;

  const pages = [1, 2, 3, 4, 5, '...', 12];

  return (
    <div className="flex justify-center items-center gap-2 mt-16 mb-24">
      <button 
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0f0f1a] transition-colors disabled:opacity-30"
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page, index) => {
        if (page === '...') {
          return <span key={index} className="px-2 text-gray-400 font-medium tracking-widest">...</span>;
        }

        const isCurrent = currentPage === page;
        
        return (
          <button
            key={index}
            onClick={() => setCurrentPage(page as number)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              isCurrent 
                ? 'bg-[#6C5CE7] text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-[#0f0f1a]'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button 
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0f0f1a] transition-colors disabled:opacity-30"
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
