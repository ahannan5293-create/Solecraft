'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Product } from '@/lib/products/map-product';

const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false });

export default function ProductGallery({ product, images }: { product: Product, images: string[] }) {
  const [activeTab, setActiveTab] = useState<'images' | '3d'>('images');
  const [mainImageIndex, setMainImageIndex] = useState(0);

  return (
    <div className="w-full md:w-1/2 bg-[#f7f8fb] flex flex-col relative shrink-0">
      {/* Tab Toggle (if 3D exists) */}
      {product.model3dUrl && (
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
        {activeTab === '3d' && product.model3dUrl ? (
          <ModelViewer src={product.model3dUrl} />
        ) : (
          <div className="relative w-full h-full max-w-[80%] max-h-[80%] drop-shadow-2xl">
            <Image 
              src={images[mainImageIndex]} 
              alt={product.name} 
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
              <div className="absolute inset-0 w-full h-full p-2">
                <Image src={img} alt="Thumbnail" fill className="object-contain p-2" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
