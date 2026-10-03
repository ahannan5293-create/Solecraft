import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createCheckoutSession } from '@/lib/safepay/client'

const FREE_SHIPPING_THRESHOLD = 15000
const FLAT_SHIPPING_COST = 250

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { items, addressId, contactPhone, paymentMethod } = body

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!addressId) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    if (paymentMethod !== 'card' && paymentMethod !== 'cod') {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    if (paymentMethod === 'cod' && !contactPhone) {
      return NextResponse.json({ error: 'Contact phone is required for Cash on Delivery' }, { status: 400 })
    }

    // 1. Fetch user's chosen address
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', user.id)
      .single()

    if (addressError || !address) {
      return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 })
    }

    let subtotal = 0
    const snapshotItems = []

    // 2 & 3. Validate items and calculate subtotal
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          is_active,
          product_sizes (size, stock_quantity)
        `)
        .eq('id', item.productId)
        .single()

      if (productError || !product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 400 })
      }

      if (!product.is_active) {
        return NextResponse.json({ error: `Product ${product.name} is no longer available` }, { status: 400 })
      }

      const sizeData = product.product_sizes.find((s: any) => s.size === item.size)
      if (!sizeData) {
        return NextResponse.json({ error: `Size ${item.size} is not available for ${product.name}` }, { status: 400 })
      }

      if (sizeData.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name} (Size ${item.size}). Only ${sizeData.stock_quantity} left.` }, { status: 400 })
      }

      subtotal += Number(product.price) * item.quantity
      snapshotItems.push({
        product_id: product.id,
        product_name: product.name,
        size: item.size,
        quantity: item.quantity,
        unit_price: product.price
      })
    }

    // 4 & 5. Shipping & Total
    const shipping_cost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST
    const total = subtotal + shipping_cost

    // Get contact email from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, phone')
      .eq('id', user.id)
      .single()
      
    const contactEmail = profile?.email || user.email || 'customer@example.com'
    const finalPhone = contactPhone || profile?.phone || address.phone || ''

    // 6. Insert Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        subtotal,
        shipping_cost,
        total,
        currency: 'PKR',
        shipping_address: address, // Snapshot JSONB
        contact_email: contactEmail,
        contact_phone: finalPhone,
        payment_gateway: paymentMethod === 'cod' ? 'cod' : 'safepay'
      }])
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // 7. Insert Order Items
    const orderItemsToInsert = snapshotItems.map(item => ({
      order_id: order.id,
      ...item
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) {
      console.error('Order items insertion error:', itemsError)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    // 8. Branch on Payment Method
    if (paymentMethod === 'cod') {
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
      )
      const { decrementStockForOrder } = await import('@/lib/orders/decrement-stock')
      await decrementStockForOrder(supabaseAdmin, order.id)
      
      return NextResponse.json({ orderId: order.id, redirectTo: `/checkout/success?order_id=${order.id}` })
    } else {
      let checkoutUrl = ''
      try {
        const session = await createCheckoutSession({
          id: order.id,
          total: order.total,
          currency: order.currency,
          contactEmail: order.contact_email
        })
        checkoutUrl = session.checkoutUrl
      } catch (safepayErr: any) {
        console.error('Safepay error:', safepayErr)
        return NextResponse.json({ error: 'Payment service unavailable. Please try again later.' }, { status: 503 })
      }
      return NextResponse.json({ orderId: order.id, checkoutUrl })
    }

  } catch (err: any) {
    console.error('Checkout unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
