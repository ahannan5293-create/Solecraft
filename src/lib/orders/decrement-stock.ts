import { SupabaseClient } from '@supabase/supabase-js'

export async function decrementStockForOrder(supabaseAdmin: SupabaseClient, orderId: string): Promise<void> {
  // Fetch the order items
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('product_id, size, quantity')
    .eq('order_id', orderId)

  if (itemsError) {
    console.error(`[decrementStockForOrder] Failed to fetch items for order ${orderId}:`, itemsError)
    return
  }

  if (items && items.length > 0) {
    for (const item of items) {
      // Fetch current stock
      const { data: currentSize, error: sizeError } = await supabaseAdmin
        .from('product_sizes')
        .select('stock_quantity')
        .eq('product_id', item.product_id)
        .eq('size', item.size)
        .single()
        
      if (sizeError) {
        console.error(`[decrementStockForOrder] Failed to fetch size ${item.size} for product ${item.product_id}:`, sizeError)
        continue
      }

      if (currentSize) {
        const newStock = Math.max(0, currentSize.stock_quantity - item.quantity)
        if (currentSize.stock_quantity - item.quantity < 0) {
          console.warn(`[decrementStockForOrder] Oversold warning for product ${item.product_id} size ${item.size}`)
        }
        
        const { error: updateError } = await supabaseAdmin
          .from('product_sizes')
          .update({ stock_quantity: newStock })
          .eq('product_id', item.product_id)
          .eq('size', item.size)

        if (updateError) {
          console.error(`[decrementStockForOrder] Failed to update stock for product ${item.product_id} size ${item.size}:`, updateError)
        }
      }
    }
  }
}
