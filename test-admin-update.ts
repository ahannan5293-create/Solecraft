import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function test() {
  // Get latest order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!order) {
    console.log("No order found")
    return
  }

  console.log("Found order:", order.id)
  
  // Update it
  const updatePayload = {
    status: 'fulfilled',
    tracking_number: 'TCS123456789',
    carrier: 'TCS',
    estimated_delivery: '2026-10-10T00:00:00.000Z',
    shipped_at: new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', order.id)

  if (error) {
    console.error("Update error:", error)
  } else {
    console.log("Updated successfully!")
    
    // Check DB again to confirm shipped_at
    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('shipped_at, tracking_number, carrier, estimated_delivery, status')
      .eq('id', order.id)
      .single()
      
    console.log("Verified in DB:", updatedOrder)
  }
}

test()
