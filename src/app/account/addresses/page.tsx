import React from 'react'
import { requireUser } from '@/utils/auth'
import AddressListClient from '@/components/account/AddressListClient'
import { MapPin, Star } from 'lucide-react'

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

  const safeAddresses = addresses || []

  const cards = safeAddresses.map((address) => (
    <React.Fragment key={`static-${address.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${address.is_default ? 'bg-[#6C5CE7] text-white' : 'bg-gray-100 text-gray-500'}`}>
            {address.is_default ? <Star className="w-5 h-5 fill-current" /> : <MapPin className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-[#0f0f1a]">{address.full_name}</h4>
            <p className="text-sm font-medium text-gray-500">{address.phone}</p>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 flex-1 flex flex-col gap-1 mb-6">
        <p>{address.address_line1}</p>
        {address.address_line2 && <p>{address.address_line2}</p>}
        <p>{address.city}{address.state ? `, ${address.state}` : ''} {address.postal_code}</p>
        <p>{address.country}</p>
      </div>
    </React.Fragment>
  ))

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-[#0f0f1a]">Saved Addresses</h2>
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
          {safeAddresses.length} Address{safeAddresses.length !== 1 && 'es'}
        </span>
      </div>

      <AddressListClient addresses={safeAddresses} cards={cards} />
    </div>
  )
}

