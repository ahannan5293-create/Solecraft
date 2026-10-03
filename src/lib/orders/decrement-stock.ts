import { SupabaseClient } from '@supabase/supabase-js'

export async function decrementStockForOrder(supabase: SupabaseClient, orderId: string): Promise<void> {
  const { error } = await supabase.rpc('decrement_stock_for_order', {
    p_order_id: orderId
  })

  if (error) {
    console.error(`[decrementStockForOrder] RPC failed for order ${orderId}:`, error)
  }
}
