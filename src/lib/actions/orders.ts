'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function requestCancellationAction(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('orders')
    .update({ cancellation_requested: true, cancellation_requested_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) throw error
  revalidatePath(`/account/orders/${orderId}`)
}

