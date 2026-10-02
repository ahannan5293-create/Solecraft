'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, MapPin, Loader2, Star, Check } from 'lucide-react'

type Address = {
  id: string
  user_id: string
  label: string | null
  full_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  is_default: boolean
}

export default function AddressManager({ initialAddresses, userId }: { initialAddresses: Address[], userId: string }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Address>>({})
  
  const router = useRouter()
  const supabase = createClient()

  const handleEdit = (address: Address) => {
    setFormData(address)
    setIsEditing(address.id)
    setIsAdding(false)
  }

  const handleAdd = () => {
    setFormData({
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Pakistan',
      label: 'Home',
      is_default: addresses.length === 0
    })
    setIsAdding(true)
    setIsEditing(null)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setIsEditing(null)
    setFormData({})
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) throw error
      setAddresses(prev => prev.filter(a => a.id !== id))
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to delete address.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    setIsLoading(true)
    try {
      // Unset old default
      const oldDefault = addresses.find(a => a.is_default)
      if (oldDefault) {
        await supabase.from('addresses').update({ is_default: false }).eq('id', oldDefault.id)
      }
      
      // Set new default
      const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id)
      if (error) throw error
      
      setAddresses(prev => prev.map(a => ({
        ...a,
        is_default: a.id === id
      })))
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to set default address.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (formData.is_default) {
        // If this new/edited one is default, unset others first
        const oldDefault = addresses.find(a => a.is_default && a.id !== formData.id)
        if (oldDefault) {
          await supabase.from('addresses').update({ is_default: false }).eq('id', oldDefault.id)
        }
      }

      if (isEditing) {
        const { data, error } = await supabase
          .from('addresses')
          .update(formData)
          .eq('id', isEditing)
          .select()
          .single()
        
        if (error) throw error
        setAddresses(prev => prev.map(a => a.id === isEditing ? data : (formData.is_default ? { ...a, is_default: false } : a)))
      } else {
        const { data, error } = await supabase
          .from('addresses')
          .insert([{ ...formData, user_id: userId }])
          .select()
          .single()
          
        if (error) throw error
        setAddresses(prev => [data, ...prev].map(a => (a.id !== data.id && formData.is_default) ? { ...a, is_default: false } : a))
      }
      
      handleCancel()
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to save address.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Address Form */}
      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#6C5CE7]">
          <h3 className="text-xl font-bold text-[#0f0f1a] mb-6">
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </h3>
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
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-white bg-[#6C5CE7] hover:bg-[#5a4bd1] transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Address'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {!isAdding && !isEditing && (
        <>
          {addresses.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-[#0f0f1a] mb-2">No addresses saved</h2>
              <p className="text-gray-500 mb-6 max-w-sm">Save your shipping addresses for a faster checkout experience.</p>
              <button 
                onClick={handleAdd}
                className="inline-flex items-center gap-2 bg-[#0f0f1a] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <button 
                onClick={handleAdd}
                className="min-h-[200px] flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-500 group"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-bold text-gray-700">Add New Address</span>
              </button>

              {addresses.map(address => (
                <div key={address.id} className={`p-6 rounded-2xl border ${address.is_default ? 'border-[#6C5CE7] shadow-sm bg-[#fcfbfff0]' : 'border-gray-100 bg-white hover:border-gray-200 transition-colors'} flex flex-col`}>
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
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-auto">
                    <button 
                      onClick={() => handleEdit(address)}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-gray-200 text-[#0f0f1a] font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(address.id)}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-red-100 text-red-600 font-bold text-xs uppercase hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    {!address.is_default && (
                      <button 
                        onClick={() => handleSetDefault(address.id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-[#6C5CE7]/20 text-[#6C5CE7] font-bold text-xs uppercase hover:bg-purple-50 transition-colors"
                        title="Set as Default"
                      >
                        <Check className="w-3.5 h-3.5" /> Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
    </div>
  )
}
