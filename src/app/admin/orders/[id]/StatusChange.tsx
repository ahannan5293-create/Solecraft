'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

const STATUSES = ['pending', 'paid', 'confirmed', 'fulfilled', 'failed', 'cancelled', 'refunded']

export default function StatusChange({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [status, setStatus] = useState(initialStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async () => {
    if (status === initialStatus) return

    if (!confirm(`Are you sure you want to change this order's status to "${status}"?`)) {
      setStatus(initialStatus)
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (updateError) throw updateError

      router.refresh()
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err.message || 'Failed to update status')
      setStatus(initialStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={isUpdating}
        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-[#0f0f1a] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s.toUpperCase()}</option>
        ))}
      </select>
      
      <button
        onClick={handleUpdate}
        disabled={isUpdating || status === initialStatus}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center min-w-[120px] ${
          status === initialStatus 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-[#0f0f1a] text-white hover:-translate-y-0.5'
        }`}
      >
        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Status'}
      </button>

      {error && <span className="text-sm font-medium text-red-500">{error}</span>}
    </div>
  )
}
