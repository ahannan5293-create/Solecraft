import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import { ShoppingBag, ChevronRight, Search, Filter } from 'lucide-react'

export default async function AdminOrdersPage(props: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin()
  const searchParams = await props.searchParams
  const statusFilter = searchParams.status

  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`
      id, 
      created_at, 
      status, 
      contact_email, 
      total,
      payment_gateway,
      order_items (id)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('[admin/orders] query failed:', error.message, error.details, error.hint)
  }

  const statuses = ['all', 'pending', 'paid', 'confirmed', 'fulfilled', 'failed', 'cancelled', 'refunded']

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f0f1a] mb-1">Orders</h1>
          <p className="text-sm font-medium text-gray-500">Manage and track customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mr-2">
          <Filter className="w-4 h-4 text-gray-400" />
          Status
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => {
            const isActive = (s === 'all' && !statusFilter) || statusFilter === s
            return (
              <Link
                key={s}
                href={s === 'all' ? '/admin/orders' : `/admin/orders?status=${s}`}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                  isActive 
                    ? 'bg-[#0f0f1a] text-white' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s}
              </Link>
            )
          })}
        </div>
      </div>

      {/* List */}
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
            <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">No orders found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {statusFilter ? `No orders match the status "${statusFilter}".` : "Orders will appear here once checkout is live and customers start purchasing."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
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
                        <Link href={`/admin/orders/${order.id}`} className="text-sm font-bold text-[#6C5CE7] hover:underline">
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-[#0f0f1a]">{order.contact_email}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'confirmed' ? 'bg-sky-50 text-sky-700' :
                          order.status === 'paid' ? 'bg-purple-50 text-purple-700' :
                          order.status === 'fulfilled' ? 'bg-green-50 text-green-700' :
                          ['failed', 'cancelled', 'refunded'].includes(order.status) ? 'bg-red-50 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${
                          order.payment_gateway === 'cod' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {order.payment_gateway === 'cod' ? 'COD' : 'Card'}
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
                          href={`/admin/orders/${order.id}`}
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
