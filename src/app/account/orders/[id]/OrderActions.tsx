'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { RotateCcw, XCircle, CheckCircle, Loader2 } from 'lucide-react'

interface OrderActionsProps {
  orderId: string
  status: string
  cancellationRequested: boolean
}

export default function OrderActions({ orderId, status, cancellationRequested }: OrderActionsProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const canCancel = !cancellationRequested && ['pending', 'paid'].includes(status)
  
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to request cancellation for this order?')) return
    
    setIsCancelling(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          cancellation_requested: true,
          cancellation_requested_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error
      
      setSuccess('Cancellation requested successfully.')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to request cancellation')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReorder = async () => {
    setIsReordering(true)
    // Simulate adding to cart or redirecting to checkout
    setTimeout(() => {
      setIsReordering(false)
      alert('Reorder feature is coming soon! For now, please add items to your cart manually.')
    }, 500)
  }

  if (!canCancel && !['fulfilled', 'delivered', 'cancelled', 'refunded', 'failed'].includes(status)) {
    return null
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {success && <p className="text-sm text-green-600 font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {success}</p>}
      
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          className="w-full py-3 px-4 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
          Request Cancellation
        </button>
      )}

      {['fulfilled', 'delivered', 'cancelled', 'refunded'].includes(status) && (
        <button
          onClick={handleReorder}
          disabled={isReordering}
          className="w-full py-3 px-4 rounded-xl bg-[#0f0f1a] text-white font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isReordering ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
          Reorder Items
        </button>
      )}
    </div>
  )
}
