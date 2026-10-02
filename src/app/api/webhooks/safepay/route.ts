import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySafepayWebhookSignature } from '@/lib/safepay/client'
import { decrementStockForOrder } from '@/lib/orders/decrement-stock'

// Named constant for Safepay signature header. Verify against docs!
const SAFEPAY_SIGNATURE_HEADER_NAME = 'x-sfpy-signature'

export async function POST(req: Request) {
  // 1. Read raw body
  const rawBody = await req.text()
  
  // 2. Extract signature header
  const signatureHeader = req.headers.get(SAFEPAY_SIGNATURE_HEADER_NAME)

  if (!verifySafepayWebhookSignature(rawBody, signatureHeader)) {
    console.error('[webhooks/safepay] Signature verification failed.')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Parse JSON after signature validation
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch (err) {
    console.error('[webhooks/safepay] Malformed JSON payload.')
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 })
  }

  // 4. Extract order reference and payment outcome
  // Note: Confirm field names (e.g., `reference`, `order_id`, `state`, `status`) with Safepay documentation.
  const orderId = payload.reference || payload.order_id
  const paymentState = payload.state || payload.status // assuming 'PAID' or 'FAILED'
  const paymentReference = payload.tracker || payload.transaction_id || 'safepay_ref'

  if (!orderId) {
    console.error('[webhooks/safepay] Missing order ID in payload.')
    return NextResponse.json({ error: 'Missing order reference' }, { status: 400 })
  }

  // Service role client needed because orders_update_admin_only blocks regular users
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  try {
    // 5. Fetch the order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      console.error(`[webhooks/safepay] Order ${orderId} not found.`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 6. Idempotency Check
    if (order.status !== 'pending') {
      console.log(`[webhooks/safepay] Order ${orderId} is already ${order.status}. Ignoring webhook.`)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Determine success or failure. Note: confirm 'PAID' status string from Safepay.
    const isSuccess = ['PAID', 'SUCCESS', 'COMPLETED'].includes(String(paymentState).toUpperCase())
    const isFailure = ['FAILED', 'CANCELED', 'CANCELLED'].includes(String(paymentState).toUpperCase())

    if (isSuccess) {
      // 7. Payment Succeeded
      
      // Update order status first
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_reference: paymentReference,
          payment_signature: signatureHeader || 'verified'
        })
        .eq('id', orderId)

      if (updateError) {
        console.error(`[webhooks/safepay] Failed to update order ${orderId}:`, updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      // Decrement stock for order items using the shared stock-decrement logic
      await decrementStockForOrder(supabaseAdmin, orderId)
      
    } else if (isFailure) {
      // 8. Payment Failed
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'failed'
        })
        .eq('id', orderId)

      if (updateError) {
        console.error(`[webhooks/safepay] Failed to update order ${orderId}:`, updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
    }

    // 9. Return 200 OK
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (err) {
    console.error(`[webhooks/safepay] Unexpected error processing order ${orderId}:`, err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
