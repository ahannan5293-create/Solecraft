'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function updateOrderStatusAction(
  orderId: string, 
  newStatus?: string, 
  trackingFields?: {
    trackingNumber?: string | null
    carrier?: string | null
    estimatedDelivery?: string | null
  }
) {
  await requireAdmin()

  const supabase = await createClient()

  // First fetch the existing order to check current tracking/carrier for shipped_at logic
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('tracking_number, carrier')
    .eq('id', orderId)
    .single()

  if (fetchError || !existingOrder) {
    throw new Error('Order not found')
  }

  const updatePayload: any = {}
  
  if (newStatus !== undefined) {
    updatePayload.status = newStatus
  }

  if (trackingFields) {
    if (trackingFields.trackingNumber !== undefined) updatePayload.tracking_number = trackingFields.trackingNumber
    if (trackingFields.carrier !== undefined) updatePayload.carrier = trackingFields.carrier
    if (trackingFields.estimatedDelivery !== undefined) updatePayload.estimated_delivery = trackingFields.estimatedDelivery

    const oldTracking = existingOrder.tracking_number || ''
    const oldCarrier = existingOrder.carrier || ''
    const newTracking = trackingFields.trackingNumber || ''
    const newCarrier = trackingFields.carrier || ''

    const isNewTracking = !oldTracking && newTracking
    const isNewCarrier = !oldCarrier && newCarrier

    if (isNewTracking || isNewCarrier) {
      updatePayload.shipped_at = new Date().toISOString()
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    return { success: true }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  return { success: true }
}
