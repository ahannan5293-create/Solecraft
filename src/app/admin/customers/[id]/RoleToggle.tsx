'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Shield, ShieldOff } from 'lucide-react'

export default function RoleToggle({ 
  customerId, 
  currentRole, 
  isSelf 
}: { 
  customerId: string
  currentRole: string
  isSelf: boolean 
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = currentRole === 'admin'

  const handleToggle = async () => {
    if (isSelf && isAdmin) {
      alert("You cannot demote yourself. Another admin must do this.")
      return
    }

    const targetRole = isAdmin ? 'customer' : 'admin'
    
    let confirmMsg = ''
    if (targetRole === 'admin') {
      confirmMsg = "Are you sure you want to PROMOTE this user to Admin? They will have full access to the dashboard, including modifying products and roles."
    } else {
      confirmMsg = "Are you sure you want to DEMOTE this user to Customer? They will lose all access to the admin dashboard."
    }

    if (!confirm(confirmMsg)) return

    setIsUpdating(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', customerId)

      if (updateError) throw updateError

      router.refresh()
    } catch (err: any) {
      console.error('Error updating role:', err)
      setError(err.message || 'Failed to update role')
    } finally {
      setIsUpdating(false)
    }
  }

  // If viewing self and already admin, don't even show the demote button to prevent confusion
  if (isSelf && isAdmin) return null

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[160px] ${
          isAdmin 
            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
            : 'bg-[#6C5CE7] text-white hover:bg-[#5a4bd1]'
        }`}
      >
        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <>
            {isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            {isAdmin ? 'Demote to Customer' : 'Promote to Admin'}
          </>
        )}
      </button>
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  )
}
