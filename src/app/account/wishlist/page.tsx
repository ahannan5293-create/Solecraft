import React from 'react'
import { requireUser } from '@/utils/auth'
import ProductCard from '@/components/shop/ProductCard'
import Link from 'next/link'
import EmptyStateGraphics from '@/components/layout/EmptyStateGraphics'
import { mapProduct } from '@/lib/products/map-product'
import { Heart } from 'lucide-react'

export default async function WishlistPage() {
  const { user, supabase } = await requireUser('/account/wishlist')

  const { data: wishlists, error } = await supabase
    .from('wishlists')
    .select(`
      product_id,
      products (*, product_images(*), product_sizes(*), product_colors(*))
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('[account/wishlist] query failed:', error.message)
  }

  const rawItems = (wishlists || [])
    .map(w => w.products as any)
    .filter(p => p && p.is_active) // Ensure product exists and is active

  const items = rawItems.map(mapProduct)

  if (error) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-red-300" />
        </div>
        <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">Something went wrong</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          We couldn't load your wishlist. Please try again later.
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0f0f1a] mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Keep track of items you love. Click the heart icon on any product to save it here.
        </p>
        <Link 
          href="/shop" 
          className="inline-block bg-[#0f0f1a] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-[#0f0f1a]">My Wishlist</h2>
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
          {items.length} Item{items.length !== 1 && 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((product: any, index: number) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={index} 
          />
        ))}
      </div>
    </div>
  )
}
