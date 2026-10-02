import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Users, ShoppingBag, DollarSign, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { mapProduct, Product } from '@/lib/products/map-product'

export default async function AdminDashboard() {
  await requireAdmin()
  
  const supabase = await createClient()

  // 1. Stats
  const [{ count: totalProducts, error: err1 }, { count: activeProducts, error: err2 }, { count: totalCustomers, error: err3 }, { count: totalOrders, error: err4 }, { data: recentProductsRaw, error: err5 }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select(`*, product_images(id, url, alt_text, display_order)`).order('created_at', { ascending: false }).limit(5)
  ])

  if (err1 || err2 || err3 || err4 || err5) {
    console.error('[admin/dashboard] stat queries failed:', { err1, err2, err3, err4, err5 })
  }

  // Total Revenue calculation (summing total_amount of paid/fulfilled orders)
  // For now, doing it in memory since we don't expect millions yet. In prod, use an RPC or aggregated view.
  const { data: revenueData, error: err6 } = await supabase
    .from('orders')
    .select('total')
    .in('status', ['paid', 'fulfilled'])

  if (err6) {
    console.error('[admin/dashboard] revenue query failed:', err6.message, err6.details, err6.hint)
  }
  
  const totalRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.total) || 0), 0) || 0

  const recentProducts = (recentProductsRaw || []).map(mapProduct)
  
  // Recent Orders (empty for now as checkout isn't built)
  const { data: recentOrders, error: err7 } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (err7) {
    console.error('[admin/dashboard] recent orders query failed:', err7.message, err7.details, err7.hint)
  }

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold text-[#0f0f1a] mb-8">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Total Products</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#6C5CE7]" />
            </div>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0f0f1a]">{totalProducts || 0}</span>
            <span className="text-sm font-medium text-gray-400">({activeProducts || 0} active)</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Total Customers</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#6C5CE7]" />
            </div>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0f0f1a]">{totalCustomers || 0}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Total Orders</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#6C5CE7]" />
            </div>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0f0f1a]">{totalOrders || 0}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Total Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#6C5CE7]" />
            </div>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0f0f1a]">{formatPrice(totalRevenue)}</span>
          </div>
        </div>

      </div>

      {/* Side-by-side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#0f0f1a]">Recent Products</h2>
            <Link href="/admin/products" className="text-sm font-semibold text-[#6C5CE7] hover:text-[#5a4bd1] transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 p-2">
            {recentProducts.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400">
                <Package className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-medium">No products found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentProducts.map(product => {
                  const displayImage = product.images?.[0]?.url || '/assets/images/shop/sneaker.png';
                  return (
                    <li key={product.id}>
                      <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl group">
                        <div className="w-12 h-12 rounded-lg bg-[#f7f8fb] relative flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-[#6C5CE7]/30 transition-colors">
                          <Image src={displayImage} alt={product.name} fill className="object-contain p-2" sizes="48px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#0f0f1a] truncate">{product.name}</h4>
                          <p className="text-xs text-gray-500 font-medium capitalize">{product.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-sm font-bold text-[#0f0f1a]">{formatPrice(product.price)}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {product.isActive ? 'Active' : 'Draft'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#0f0f1a]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-[#6C5CE7] hover:text-[#5a4bd1] transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 p-2 flex flex-col justify-center">
            {(!recentOrders || recentOrders.length === 0) ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400">
                <ShoppingBag className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-medium">No orders have been placed yet.</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs text-center">Once checkout is active, new orders will appear here automatically.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentOrders.map((order: any) => (
                  <li key={order.id}>
                    <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">#{order.id.slice(0,8)}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.status === 'confirmed' ? 'bg-sky-50 text-sky-700' :
                            order.status === 'paid' ? 'bg-purple-50 text-purple-700' :
                            order.status === 'fulfilled' ? 'bg-green-50 text-green-700' :
                            ['failed', 'cancelled', 'refunded'].includes(order.status) ? 'bg-red-50 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.payment_gateway === 'cod' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {order.payment_gateway === 'cod' ? 'COD' : 'Card'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#0f0f1a] truncate">{order.contact_email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-sm font-bold text-[#0f0f1a]">{formatPrice(order.total)}</span>
                        <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
