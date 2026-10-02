import React from 'react'
import { requireUser } from '@/utils/auth'
import AddressManager from './AddressManager'

export const metadata = {
  title: 'My Addresses | SOLECRAFT',
  description: 'Manage your shipping and billing addresses.',
}

export default async function AddressesPage() {
  const { user, supabase } = await requireUser('/account/addresses')

  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[account/addresses] query failed:', error.message)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-[#0f0f1a]">Saved Addresses</h2>
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
          {addresses?.length || 0} Address{addresses?.length !== 1 && 'es'}
        </span>
      </div>

      <AddressManager initialAddresses={addresses || []} userId={user.id} />
    </div>
  )
}
