'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { generalApiRateLimit } from '@/lib/rate-limit'

export async function toggleWishlistAction(productId: string, isCurrentlyWishlisted: boolean) {
  const cookieStore = await cookies()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const identifier = user.id
  const { success } = await generalApiRateLimit.limit(identifier)
  if (!success) throw new Error('Too many requests, please slow down')

  if (isCurrentlyWishlisted) {
    const { error } = await supabase.from('wishlists').delete()
      .eq('product_id', productId).eq('user_id', user.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('wishlists').insert({ product_id: productId, user_id: user.id })
    if (error) throw error
  }
}
