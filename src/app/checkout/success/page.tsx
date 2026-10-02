import React from 'react'
import { createClient } from '@/utils/supabase/server'
import CheckoutSuccessClient from './CheckoutSuccessClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Order Status | SOLECRAFT',
  description: 'Track your order payment status.',
}

export default async function CheckoutSuccessPage(props: { searchParams: Promise<{ order_id?: string }> }) {
  const searchParams = await props.searchParams
  const orderId = searchParams.order_id

  if (!orderId) {
    redirect('/account/orders')
  }

  const supabase = await createClient()

  // Fetch initial order state
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total,
      payment_gateway,
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        size
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    redirect('/account/orders')
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full px-6">
        <CheckoutSuccessClient initialOrder={order} />
      </div>
    </div>
  )
}
