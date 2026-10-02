import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import Link from 'next/link'
import { Users, ChevronRight, Search } from 'lucide-react'

export default async function AdminCustomersPage(props: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin()
  const searchParams = await props.searchParams
  const query = searchParams.q || ''

  const supabase = await createClient()

  let dbQuery = supabase
    .from('profiles')
    .select(`
      id,
      username,
      email,
      role,
      created_at
    `)
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`username.ilike.%${query}%,email.ilike.%${query}%`)
  }

  const { data: customers, error } = await dbQuery

  if (error) {
    console.error('[admin/customers] query failed:', error.message, error.details, error.hint)
  }

  // Fetch order counts
  const profileIds = customers?.map(c => c.id) || []
  let orderCounts: Record<string, number> = {}

  if (profileIds.length > 0) {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('user_id')
      .in('user_id', profileIds)

    if (orderError) {
      console.error('[admin/customers] order count query failed:', orderError.message, orderError.details, orderError.hint)
    }

    orderData?.forEach(order => {
      if (order.user_id) {
        orderCounts[order.user_id] = (orderCounts[order.user_id] || 0) + 1
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f0f1a] mb-1">Customers</h1>
          <p className="text-sm font-medium text-gray-500">Manage user accounts and roles</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <form className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by username or email..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-[#0f0f1a] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all placeholder:text-gray-400 placeholder:font-medium"
          />
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-red-300" />
            </div>
            <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">Something went wrong loading customers</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        ) : (!customers || customers.length === 0) ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">No customers found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {query ? `No users match the search "${query}".` : "No registered users found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Orders</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => {
                  const orderCount = orderCounts[customer.id] || 0
                  
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <Link href={`/admin/customers/${customer.id}`} className="block">
                          <span className="block text-sm font-bold text-[#0f0f1a] mb-0.5">{customer.username || 'Unknown'}</span>
                          <span className="block text-xs font-medium text-gray-500">{customer.email || 'No email'}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          customer.role === 'admin' ? 'bg-[#6C5CE7] text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {customer.role || 'customer'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-600">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-[#0f0f1a] text-right">
                        {orderCount}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/admin/customers/${customer.id}`}
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
