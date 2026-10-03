'use client'

import React, { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { createAddressAction, updateAddressAction } from '@/lib/actions/addresses'

export default function AddressFormModal({ initialData, onClose }: { initialData: any | null, onClose: () => void }) {
  const [formData, setFormData] = useState<any>(initialData || {
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Pakistan',
    label: 'Home',
    is_default: false
  })
  
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    startTransition(async () => {
      try {
        if (initialData?.id) {
          await updateAddressAction(initialData.id, formData)
        } else {
          await createAddressAction(formData)
        }
        onClose()
      } catch (err: any) {
        setError(err.message || 'Failed to save address')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-[#0f0f1a] mb-6">
          {initialData ? 'Edit Address' : 'Add New Address'}
        </h3>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.full_name || ''} 
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                required
                value={formData.phone || ''} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 1</label>
            <input 
              type="text" 
              required
              value={formData.address_line1 || ''} 
              onChange={e => setFormData({...formData, address_line1: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input 
              type="text" 
              value={formData.address_line2 || ''} 
              onChange={e => setFormData({...formData, address_line2: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
              <input 
                type="text" 
                required
                value={formData.city || ''} 
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">State / Province</label>
              <input 
                type="text" 
                required
                value={formData.state || ''} 
                onChange={e => setFormData({...formData, state: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Postal Code</label>
              <input 
                type="text" 
                value={formData.postal_code || ''} 
                onChange={e => setFormData({...formData, postal_code: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
              <input 
                type="text" 
                required
                disabled
                value={formData.country || 'Pakistan'} 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.is_default || false}
                onChange={e => setFormData({...formData, is_default: e.target.checked})}
                className="w-4 h-4 text-[#6C5CE7] bg-gray-100 border-gray-300 rounded focus:ring-[#6C5CE7]"
              />
              <span className="text-sm font-semibold text-[#0f0f1a]">Set as default address</span>
            </label>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-white bg-[#6C5CE7] hover:bg-[#5a4bd1] transition-colors flex items-center justify-center min-w-[120px]"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Address'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
