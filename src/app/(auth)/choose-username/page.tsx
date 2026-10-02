'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ChooseUsernamePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Check if they already chose one
      const { data: profile } = await supabase
        .from('profiles')
        .select('username_chosen')
        .eq('id', session.user.id)
        .single()
        
      if (profile?.username_chosen) {
        router.push('/')
        return
      }

      setIsReady(true)
    }
    
    checkAuth()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3-20 characters, containing only letters, numbers, and underscores.')
      return
    }

    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Pre-check username
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()
        
      if (existingUser) {
        setError('Username already taken.')
        setLoading(false)
        return
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          username,
          username_chosen: true 
        })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (!isReady) return null

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Choose a username</h2>
        <p className="mt-2 text-sm text-neutral-600">Pick a unique username for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-neutral-700">Username</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-xl bg-black px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-70 transition-colors"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
