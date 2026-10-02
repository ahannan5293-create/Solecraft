import React from 'react'
import { requireUser } from '@/utils/auth'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import { ShoppingBag, ChevronRight } from 'lucide-react'

export default async function OrdersPage() {
  const { user, supabase } = await requireUser('/account/orders')

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      total,
      order_items ( id )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[account/orders] query failed:', error.message, error.details, error.hint)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-[#0f0f1a]">Order History</h2>
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
          {orders?.length || 0} Order{(orders?.length !== 1) && 's'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-red-300" />
            </div>
            <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">Something went wrong loading orders</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        ) : (!orders || orders.length === 0) ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#0f0f1a] mb-2">
              You haven't placed any orders yet
            </h3>
            <p className="text-gray-500 mb-8 max-w-md">
              Once you complete a purchase, your order history and details will appear here.
            </p>
            <Link 
              href="/shop" 
              className="inline-block bg-[#0f0f1a] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Items</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const itemCount = order.order_items?.length || 0;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <Link href={`/account/orders/${order.id}`} className="text-sm font-bold text-[#6C5CE7] hover:underline">
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'confirmed' ? 'bg-sky-50 text-sky-700' :
                          order.status === 'paid' ? 'bg-purple-50 text-purple-700' :
                          order.status === 'fulfilled' ? 'bg-green-50 text-green-700' :
                          ['failed', 'cancelled', 'refunded'].includes(order.status) ? 'bg-red-50 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-600 text-right">
                        {itemCount}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-[#0f0f1a] text-right">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#0f0f1a] hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
