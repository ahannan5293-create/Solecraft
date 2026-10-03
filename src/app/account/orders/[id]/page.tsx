import React from 'react'
import { requireUser } from '@/utils/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Receipt, ShoppingBag, Truck, PackageCheck, AlertCircle, Banknote } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import OrderActions from './OrderActions'

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const { user, supabase } = await requireUser(`/account/orders/${id}`)

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          name,
          category,
          product_images (url)
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  const statusColor = 
    order.status === 'paid' ? 'bg-purple-50 text-purple-700' :
    order.status === 'fulfilled' ? 'bg-green-50 text-green-700' :
    ['failed', 'cancelled', 'refunded'].includes(order.status) ? 'bg-red-50 text-red-700' :
    'bg-gray-100 text-gray-700'

  const shippingAddress = order.shipping_address as {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  } | null

  // Timeline logic
  const isCod = order.payment_gateway === 'cod'
  const steps = isCod 
    ? [
        { id: 'pending', label: 'Order Placed', active: true, completed: order.status !== 'pending' && order.status !== 'failed' && order.status !== 'cancelled' },
        { id: 'confirmed', label: 'Confirmed', active: order.status !== 'pending', completed: ['confirmed', 'fulfilled'].includes(order.status) },
        { id: 'shipped', label: 'Shipped', active: !!order.shipped_at, completed: order.status === 'fulfilled' },
        { id: 'delivered', label: 'Delivered', active: order.status === 'fulfilled', completed: order.status === 'fulfilled' }
      ]
    : [
        { id: 'pending', label: 'Order Placed', active: true, completed: order.status !== 'pending' && order.status !== 'failed' && order.status !== 'cancelled' },
        { id: 'paid', label: 'Paid', active: order.status !== 'pending', completed: ['fulfilled'].includes(order.status) || order.status === 'paid' },
        { id: 'shipped', label: 'Shipped', active: !!order.shipped_at, completed: order.status === 'fulfilled' },
        { id: 'delivered', label: 'Delivered', active: order.status === 'fulfilled', completed: order.status === 'fulfilled' }
      ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/account/orders"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-500 hover:text-[#0f0f1a] hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-[#0f0f1a]">Order #{order.id.split('-')[0]}</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isCod && (
            <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5 shadow-sm">
              <Banknote className="w-3.5 h-3.5" /> Cash on Delivery
            </div>
          )}
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
            {order.status}
          </div>
        </div>
      </div>

      {isCod && order.status === 'confirmed' && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
          <Banknote className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900">Cash on Delivery</h4>
            <p className="text-sm text-blue-700 mt-1">Pay <span className="font-bold">{formatPrice(order.total)}</span> to the courier at your door.</p>
          </div>
        </div>
      )}

      {order.cancellation_requested && order.status !== 'cancelled' && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-orange-900">Cancellation Requested</h4>
            <p className="text-sm text-orange-700 mt-1">You requested to cancel this order on {new Date(order.cancellation_requested_at).toLocaleDateString()}. We are reviewing your request.</p>
          </div>
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900">Order Cancelled</h4>
            <p className="text-sm text-red-700 mt-1">This order has been cancelled.</p>
          </div>
        </div>
      )}

      {/* Stepper */}
      {!['cancelled', 'failed', 'refunded'].includes(order.status) && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#6C5CE7] rounded-full z-0 transition-all duration-500"
              style={{ width: `${(Math.max(0, steps.filter(s => s.completed).length - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step, idx) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 border-white ${
                  step.completed ? 'bg-[#6C5CE7] text-white' : 
                  step.active ? 'bg-purple-100 text-[#6C5CE7]' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step.completed ? <PackageCheck className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide hidden sm:block ${
                  step.active || step.completed ? 'text-[#0f0f1a]' : 'text-gray-400'
                }`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking info if shipped */}
      {order.tracking_number && (
        <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl shadow-sm border border-purple-100 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#6C5CE7] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#0f0f1a]">Package is on the way</h3>
              <p className="text-sm text-gray-500">Carrier: <span className="font-semibold text-gray-700">{order.carrier || 'Standard Shipping'}</span></p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end w-full sm:w-auto">
            <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
            <div className="font-mono font-bold text-[#6C5CE7] bg-white px-4 py-2 rounded-lg border border-purple-100 w-full sm:w-auto text-center">
              {order.tracking_number}
            </div>
            {order.estimated_delivery && (
              <p className="text-xs text-gray-500 mt-2">Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Items */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0f0f1a] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#6C5CE7]" />
                Order Items
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {order.order_items?.map((item: any) => {
                const product = item.product || {}
                const displayImage = product.product_images?.[0]?.url || item.product_image_url || '/assets/images/shop/sneaker.png'

                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-20 h-20 bg-[#f7f8fb] rounded-xl flex items-center justify-center relative shrink-0 p-2">
                      <Image src={displayImage} alt={product.name || item.product_name || 'Product'} fill className="object-contain p-2" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#0f0f1a] truncate mb-1">{product.name || item.product_name || 'Unknown Product'}</h4>
                      <p className="text-xs font-medium text-gray-500 capitalize">
                        {product.category || 'N/A'} {item.size ? `• Size ${item.size}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 sm:justify-end shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-400 mb-0.5">Price</p>
                        <p className="text-sm font-bold text-[#0f0f1a]">{formatPrice(item.unit_price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-400 mb-0.5">Qty</p>
                        <p className="text-sm font-bold text-[#0f0f1a]">x{item.quantity}</p>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-xs font-medium text-gray-400 mb-0.5">Total</p>
                        <p className="text-sm font-bold text-[#0f0f1a]">{formatPrice(Number(item.unit_price) * Number(item.quantity))}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-gray-50/50 p-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.total) - Number(order.shipping_cost || 0))}</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping_cost || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-[#0f0f1a] border-t border-gray-200 pt-4">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Summary & Address */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#0f0f1a] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#6C5CE7]" /> Shipping Address
            </h3>
            {shippingAddress ? (
              <address className="not-italic text-sm font-medium text-gray-600 leading-relaxed">
                <span className="font-bold text-[#0f0f1a] block mb-1">{order.contact_email}</span>
                {shippingAddress.line1}<br />
                {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
                {shippingAddress.city}{shippingAddress.state ? `, ${shippingAddress.state}` : ''} {shippingAddress.postal_code}<br />
                {shippingAddress.country}
                {order.contact_phone && <span className="block mt-2 pt-2 border-t border-gray-100 font-bold text-[#0f0f1a]">{order.contact_phone}</span>}
              </address>
            ) : (
              <p className="text-sm text-gray-400 font-medium italic">No address provided</p>
            )}
          </div>

          <OrderActions orderId={order.id} status={order.status} cancellationRequested={order.cancellation_requested} />
        </div>
        
      </div>
    </div>
  )
}
