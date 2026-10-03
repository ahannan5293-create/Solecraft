'use client'

import React, { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react'
import { deleteAddressAction, updateAddressAction } from '@/lib/actions/addresses'

const AddressFormModal = dynamic(() => import('./AddressFormModal'), { ssr: false })

export default function AddressListClient({ 
  addresses, 
  cards 
}: { 
  addresses: any[], 
  cards: React.ReactNode[] 
}) {
  const [editingAddress, setEditingAddress] = useState<any | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    startTransition(() => {
      deleteAddressAction(id)
    })
  }

  const handleSetDefault = (id: string) => {
    startTransition(() => {
      updateAddressAction(id, { is_default: true })
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => setIsAdding(true)}
          className="min-h-[200px] flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-500 group"
        >
          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-gray-600" />
          </div>
          <span className="font-bold text-gray-700">Add New Address</span>
        </button>

        {addresses.map((address, index) => (
          <div key={address.id} className={`p-6 rounded-2xl border ${address.is_default ? 'border-[#6C5CE7] shadow-sm bg-[#fcfbfff0]' : 'border-gray-100 bg-white'} flex flex-col`}>
            
            {/* Server-rendered static card content */}
            {cards[index]}
            
            {/* Interactive Controls */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-auto">
              <button 
                onClick={() => setEditingAddress(address)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-gray-200 text-[#0f0f1a] font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button 
                onClick={() => handleDelete(address.id)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-red-100 text-red-600 font-bold text-xs uppercase hover:bg-red-50 transition-colors"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </button>
              {!address.is_default && (
                <button 
                  onClick={() => handleSetDefault(address.id)}
                  disabled={isPending}
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

      {(isAdding || editingAddress) && (
        <AddressFormModal 
          initialData={editingAddress} 
          onClose={() => {
            setIsAdding(false)
            setEditingAddress(null)
          }} 
        />
      )}
    </>
  )
}
