import React from 'react'
import Image from 'next/image'

export default function EmptyStateGraphics() {
  return (
    <div className="relative w-40 h-40 mb-6 mx-auto flex items-center justify-center">
      {/* Base glow/circle */}
      <div className="absolute inset-4 bg-[#6C5CE7]/5 rounded-full" />
      
      {/* Torus Ring (center) */}
      <div className="absolute z-10 w-24 h-24 animate-empty-float-y">
        <Image src="/assets/images/shop/torus-ring.png" alt="" fill className="object-contain" priority />
      </div>

      {/* Bubble Core (top right) */}
      <div className="absolute z-20 -top-2 right-2 w-12 h-12 animate-empty-float-x" style={{ animationDelay: '1s' }}>
        <Image src="/assets/images/shop/bubble-core.png" alt="" fill className="object-contain" priority />
      </div>

      {/* Ring Small (bottom left) */}
      <div className="absolute z-20 bottom-0 left-2 w-14 h-14 animate-empty-float-y" style={{ animationDelay: '2s' }}>
        <Image src="/assets/images/shop/ring-small.png" alt="" fill className="object-contain" priority />
      </div>
    </div>
  )
}
