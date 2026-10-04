'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

interface WishlistContextType {
  productIds: Set<string>
  isLoading: boolean
  toggle: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextType>({
  productIds: new Set(),
  isLoading: true,
  toggle: async () => {},
})

import { toggleWishlistAction } from '@/lib/actions/wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    async function loadWishlist() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (mounted) setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
      
      if (!error && data && mounted) {
        setProductIds(new Set(data.map(item => item.product_id)))
      }
      
      if (mounted) setIsLoading(false)
    }

    loadWishlist()

    return () => {
      mounted = false
    }
  }, [supabase])

  const toggle = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    const isWishlisted = productIds.has(productId)
    
    // Optimistic update
    setProductIds(prev => {
      const next = new Set(prev)
      if (isWishlisted) next.delete(productId)
      else next.add(productId)
      return next
    })

    try {
      await toggleWishlistAction(productId, isWishlisted)
    } catch (error: any) {
      console.error('Error toggling wishlist:', {
        message: error?.message,
        raw: error
      })
      alert(error?.message || 'Failed to update wishlist. Please try again.')
      // Revert optimistic update
      setProductIds(prev => {
        const next = new Set(prev)
        if (isWishlisted) next.add(productId)
        else next.delete(productId)
        return next
      })
    }
  }

  return (
    <WishlistContext.Provider value={{ productIds, isLoading, toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
