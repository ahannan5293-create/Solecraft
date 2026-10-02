import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import { ArrowLeft, User, Shield, ChevronRight } from 'lucide-react'
import RoleToggle from './RoleToggle'

export default async function AdminCustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const params = await props.params
  
  const supabase = await createClient()

  // Get current user to check for self-demote guardrail
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isSelf = currentUser?.id === params.id

  const { data: customer, error: customerError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (customerError) {
    console.error('[admin/customers/detail] profile query failed:', customerError.message, customerError.details, customerError.hint)
  }

  if (!customer) {
    notFound()
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id, 
      created_at, 
      status, 
      contact_email, 
      total,
      order_items (id)
    `)
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })

  if (ordersError) {
    console.error('[admin/customers/detail] orders query failed:', ordersError.message, ordersError.details, ordersError.hint)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-10">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0f0f1a] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0f0f1a] mb-1 flex items-center gap-3">
              {customer.username || 'Unknown User'}
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                customer.role === 'admin' ? 'bg-[#6C5CE7] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {customer.role || 'customer'}
              </span>
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Joined {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Role Change Control */}
        <RoleToggle customerId={customer.id} currentRole={customer.role || 'customer'} isSelf={isSelf} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Orders */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0f0f1a]">Customer Orders</h2>
            </div>
            
            <div className="flex-1">
              {ordersError ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                  <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">Something went wrong loading orders</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Please try again later or contact support if the issue persists.
                  </p>
                </div>
              ) : (!orders || orders.length === 0) ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm font-medium">This customer hasn't placed any orders yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="py-3 px-4">
                            <Link href={`/admin/orders/${order.id}`} className="text-sm font-bold text-[#6C5CE7] hover:underline">
                              #{order.id.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.status === 'confirmed' ? 'bg-sky-50 text-sky-700' :
                              order.status === 'paid' ? 'bg-purple-50 text-purple-700' :
                              order.status === 'fulfilled' ? 'bg-green-50 text-green-700' :
                              ['failed', 'cancelled', 'refunded'].includes(order.status) ? 'bg-red-50 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-[#0f0f1a] text-right">
                            {formatPrice(order.total)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link 
                              href={`/admin/orders/${order.id}`}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#0f0f1a] hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <ChevronRight className="w-3 h-3" />
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
        </div>

        {/* Right Column: Profile Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6C5CE7]" /> Profile Details
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-500 mb-0.5">Email</p>
                <p className="font-bold text-[#0f0f1a] break-all">{customer.email || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-0.5">Full Name</p>
                <p className="font-bold text-[#0f0f1a]">{customer.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-0.5">Role</p>
                <div className="flex items-center gap-2 mt-1">
                  {customer.role === 'admin' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-white bg-[#6C5CE7] px-2 py-0.5 rounded">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      Customer
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
