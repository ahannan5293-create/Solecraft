'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { generalApiRateLimit } from '../rate-limit'

const orderIdSchema = z.string().uuid()

export async function requestCancellationAction(orderId: string) {
  const parsed = orderIdSchema.safeParse(orderId)
  if (!parsed.success) throw new Error('Invalid order ID')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { success } = await generalApiRateLimit.limit(user.id)
  if (!success) throw new Error('Too many requests, please try again in a minute')

  const { error } = await supabase
    .from('orders')
    .update({ cancellation_requested: true, cancellation_requested_at: new Date().toISOString() })
    .eq('id', parsed.data)

  if (error) throw new Error('Failed to request cancellation')
  revalidatePath(`/account/orders/${parsed.data}`)
}

