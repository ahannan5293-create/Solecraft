import React from 'react'
import { requireUser } from '@/utils/auth'
import Link from 'next/link'
import { Package, Heart, MapPin, ChevronRight, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/format'

export default async function AccountOverview() {
  const { user, supabase } = await requireUser('/account')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', user.id)
    .single()

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: wishlistCount } = await supabase
    .from('wishlists')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: addressesCount, error: err3 } = await supabase
    .from('addresses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: recentOrders, error: err4 } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      total
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  if (err4) {
    console.error('[account/overview] query failed:', err4)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-[#0f0f1a]">
          Welcome back, {profile?.full_name || profile?.username || user.email}
        </h2>
        <p className="text-gray-500">
          Manage your orders, update your profile, and see your wishlisted items.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Total Orders</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#6C5CE7]" />
            </div>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0f0f1a]">{ordersCount || 0}</span>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Wishlist Items</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#6C5CE7]" />
            </div>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0f0f1a]">{wishlistCount || 0}</span>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Saved Addresses</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#6C5CE7]" />
            </div>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0f0f1a]">{addressesCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-[#0f0f1a]">Recent Orders</h3>
          <Link href="/account/orders" className="text-sm font-semibold text-[#6C5CE7] hover:underline">
            View All
          </Link>
        </div>

        {err4 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-red-300" />
            </div>
            <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">Something went wrong loading orders</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        ) : (!recentOrders || recentOrders.length === 0) ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">No orders found</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              You haven't placed any orders yet.
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#0f0f1a] text-white font-bold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-8 px-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-t border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order: any) => (
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
                    <td className="py-4 px-6 text-sm font-bold text-[#0f0f1a] text-right">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/account/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#6C5CE7] hover:text-[#5a4bd1] transition-colors"
                      >
                        Track Order <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
