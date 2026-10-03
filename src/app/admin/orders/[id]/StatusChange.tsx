'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

const STATUSES = ['pending', 'paid', 'confirmed', 'fulfilled', 'failed', 'cancelled', 'refunded']
const COMMON_CARRIERS = ['TCS', 'Leopards', 'M&P', 'Other']

export default function StatusChange({ 
  orderId, 
  initialStatus,
  initialTrackingNumber,
  initialCarrier,
  initialEstimatedDelivery
}: { 
  orderId: string
  initialStatus: string
  initialTrackingNumber?: string | null
  initialCarrier?: string | null
  initialEstimatedDelivery?: string | null
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [status, setStatus] = useState(initialStatus)
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '')
  
  const isCommonCarrier = !initialCarrier || COMMON_CARRIERS.includes(initialCarrier)
  const [carrierSelect, setCarrierSelect] = useState(isCommonCarrier ? (initialCarrier || '') : 'Other')
  const [customCarrier, setCustomCarrier] = useState(isCommonCarrier ? '' : (initialCarrier || ''))
  
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    initialEstimatedDelivery ? new Date(initialEstimatedDelivery).toISOString().split('T')[0] : ''
  )

  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasChanges = status !== initialStatus || 
    trackingNumber !== (initialTrackingNumber || '') || 
    (carrierSelect === 'Other' ? customCarrier : carrierSelect) !== (initialCarrier || '') ||
    estimatedDelivery !== (initialEstimatedDelivery ? new Date(initialEstimatedDelivery).toISOString().split('T')[0] : '')

  const handleUpdate = async () => {
    if (!hasChanges) return

    if (status !== initialStatus && !confirm(`Are you sure you want to change this order's status to "${status}"?`)) {
      setStatus(initialStatus)
      return
    }

    setIsUpdating(true)
    setError(null)

    const finalCarrier = carrierSelect === 'Other' ? customCarrier : carrierSelect

    const updatePayload: any = { 
      status,
      tracking_number: trackingNumber || null,
      carrier: finalCarrier || null,
      estimated_delivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null
    }

    // Set shipped_at if tracking_number or carrier transitioned from null/empty to non-empty
    const oldTracking = initialTrackingNumber || ''
    const oldCarrier = initialCarrier || ''
    const isNewTracking = !oldTracking && trackingNumber
    const isNewCarrier = !oldCarrier && finalCarrier

    if (isNewTracking || isNewCarrier) {
      updatePayload.shipped_at = new Date().toISOString()
    }

    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)

      if (updateError) throw updateError

      router.refresh()
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err.message || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const isShippingRelevant = ['confirmed', 'paid', 'fulfilled'].includes(status) || 
    Boolean(trackingNumber) || 
    Boolean(carrierSelect) || 
    Boolean(initialTrackingNumber) || 
    Boolean(initialCarrier)

  return (
    <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[320px]">
      <div className="flex items-center gap-3 justify-between">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isUpdating}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-[#0f0f1a] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] flex-1"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
        
        <button
          onClick={handleUpdate}
          disabled={isUpdating || !hasChanges}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center min-w-[120px] ${
            !hasChanges
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-[#0f0f1a] text-white hover:-translate-y-0.5'
          }`}
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Order'}
        </button>
      </div>

      {isShippingRelevant && (
        <div className="pt-3 border-t border-gray-200 space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipping Details</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Carrier</label>
              <select
                value={carrierSelect}
                onChange={(e) => setCarrierSelect(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#0f0f1a] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]"
              >
                <option value="">Select Carrier...</option>
                {COMMON_CARRIERS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            {carrierSelect === 'Other' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Custom Carrier</label>
                <input
                  type="text"
                  value={customCarrier}
                  onChange={(e) => setCustomCarrier(e.target.value)}
                  disabled={isUpdating}
                  placeholder="Carrier name"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#0f0f1a] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]"
                />
              </div>
            )}

            <div className={`space-y-1 ${carrierSelect === 'Other' ? 'col-span-2' : ''}`}>
              <label className="text-xs font-medium text-gray-600">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                disabled={isUpdating}
                placeholder="e.g. TCS123..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#0f0f1a] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium text-gray-600">Estimated Delivery</label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#0f0f1a] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]"
              />
            </div>
          </div>
        </div>
      )}

      {error && <span className="text-sm font-medium text-red-500 mt-2">{error}</span>}
    </div>
  )
}
