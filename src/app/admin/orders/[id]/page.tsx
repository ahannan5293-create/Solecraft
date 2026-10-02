import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import { ArrowLeft, User, MapPin, ShoppingBag, Banknote } from 'lucide-react'
import StatusChange from './StatusChange'

export default async function AdminOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const params = await props.params
  
  const supabase = await createClient()

  // Fetch order with related items and their products
  const { data: order, error } = await supabase
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
    .eq('id', params.id)
    .single()

  if (error) {
    console.error('[admin/orders/detail] order query failed:', error.message, error.details, error.hint)
  }

  if (!order) {
    notFound()
  }

  const statusColor = 
    order.status === 'confirmed' ? 'bg-sky-50 text-sky-700' :
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

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-10">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0f0f1a] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f0f1a] mb-2 flex items-center gap-3">
            Order #{order.id.slice(0, 8)}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
              {order.status}
            </span>
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
          {order.payment_gateway === 'cod' && (
            <div className="mt-3 inline-flex px-3 py-1.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 items-center gap-1.5">
              <Banknote className="w-4 h-4" /> Cash on Delivery
            </div>
          )}
        </div>
        
        {/* Status Change Control */}
        <StatusChange orderId={order.id} initialStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Line Items */}
        <div className="md:col-span-2 space-y-6">
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
                const displayImage = product.product_images?.[0]?.url || '/assets/images/shop/sneaker.png'

                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-20 h-20 bg-[#f7f8fb] rounded-xl flex items-center justify-center relative shrink-0 p-2">
                      <Image src={displayImage} alt={product.name || 'Product'} fill className="object-contain p-2" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#0f0f1a] truncate mb-1">{product.name || 'Unknown Product'}</h4>
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

        {/* Right Column: Customer Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6C5CE7]" /> Customer
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-500 mb-0.5">Email</p>
                <p className="font-bold text-[#0f0f1a] break-all">{order.contact_email || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-0.5">Phone</p>
                <p className="font-bold text-[#0f0f1a]">{order.contact_phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6C5CE7]" /> Shipping Address
            </h3>
            {shippingAddress ? (
              <address className="not-italic text-sm font-medium text-[#0f0f1a] leading-relaxed">
                {shippingAddress.line1}<br />
                {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
                {shippingAddress.city}{shippingAddress.state ? `, ${shippingAddress.state}` : ''} {shippingAddress.postal_code}<br />
                {shippingAddress.country}
              </address>
            ) : (
              <p className="text-sm text-gray-400 font-medium italic">No address provided</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
