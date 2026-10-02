'use client'

import React, { useEffect, useState } from 'react'
import { useCart } from '@/components/cart/CartContext'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, XCircle, Loader2, ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'

interface CheckoutSuccessClientProps {
  initialOrder: any
}

export default function CheckoutSuccessClient({ initialOrder }: CheckoutSuccessClientProps) {
  const [order, setOrder] = useState(initialOrder)
  const [attempts, setAttempts] = useState(0)
  const { clearCart } = useCart()
  const supabase = createClient()

  const isCod = order.payment_gateway === 'cod'
  const isPending = order.status === 'pending' && !isCod
  const isPaid = order.status === 'paid' || order.status === 'confirmed'
  const isFailed = order.status === 'failed' || order.status === 'cancelled'

  useEffect(() => {
    // If it's already paid, clear cart
    if (isPaid) {
      clearCart()
    }
  }, [isPaid, clearCart])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const checkStatus = async () => {
      if (!isPending) return
      
      if (attempts >= 7) {
        // ~14 seconds timeout (7 * 2s)
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('status')
        .eq('id', order.id)
        .single()

      if (data && data.status !== order.status) {
        setOrder({ ...order, status: data.status })
      } else {
        setAttempts(prev => prev + 1)
        timeoutId = setTimeout(checkStatus, 2000)
      }
    }

    if (isPending) {
      timeoutId = setTimeout(checkStatus, 2000)
    }

    return () => clearTimeout(timeoutId)
  }, [order.id, order.status, isPending, attempts, supabase])

  if (isPending && attempts < 7) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <Loader2 className="w-12 h-12 text-[#6C5CE7] animate-spin mb-6" />
        <h2 className="text-2xl font-extrabold text-[#0f0f1a] mb-2">Confirming your payment...</h2>
        <p className="text-gray-500">Please do not close this window. We are waiting for the payment gateway to confirm your transaction.</p>
      </div>
    )
  }

  if (isPending && attempts >= 7) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-6" />
        <h2 className="text-2xl font-extrabold text-[#0f0f1a] mb-2">We're still confirming your payment</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The payment provider is taking a bit longer than usual. You can check your order status shortly.
        </p>
        <Link href={`/account/orders/${order.id}`} className="bg-[#0f0f1a] text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
          Check My Orders
        </Link>
      </div>
    )
  }

  if (isFailed) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-extrabold text-[#0f0f1a] mb-2">Payment Failed</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Unfortunately, your payment could not be processed successfully. Your cart is still intact.
        </p>
        <Link href="/checkout" className="bg-[#0f0f1a] text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
          Try Again
        </Link>
      </div>
    )
  }

  // Success state (Paid)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
      <div className="p-8 md:p-12 text-center bg-green-50/50 border-b border-green-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#0f0f1a] mb-2">Order Confirmed!</h2>
        <p className="text-gray-600">
          Thank you for your purchase. Your order number is <span className="font-bold text-[#0f0f1a]">#{order.id.split('-')[0]}</span>
        </p>
        {isCod && (
          <p className="mt-4 text-sm font-bold text-[#6C5CE7] bg-purple-50 inline-block px-4 py-2 rounded-lg">
            Pay {formatPrice(order.total)} in cash when your order arrives.
          </p>
        )}
      </div>
      
      <div className="p-8 md:p-12">
        <h3 className="text-lg font-bold text-[#0f0f1a] mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#6C5CE7]" /> Order Details
        </h3>
        
        <div className="flex flex-col gap-4 mb-6">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-bold text-[#0f0f1a] text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-[#0f0f1a]">{formatPrice(item.unit_price * item.quantity)}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <span className="font-bold text-gray-500">{isCod ? 'Total to Pay' : 'Total Paid'}</span>
          <span className="text-2xl font-extrabold text-[#0f0f1a]">{formatPrice(order.total)}</span>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="px-8 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-center">
            Continue Shopping
          </Link>
          <Link href={`/account/orders/${order.id}`} className="px-8 py-3 rounded-xl font-bold text-white bg-[#6C5CE7] hover:bg-[#5a4bd1] transition-colors flex items-center justify-center gap-2">
            View Order <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
