'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { resetPasswordAction } = await import('@/lib/actions/auth')
      await resetPasswordAction(email)
      setSuccess(true)
    } catch (err: any) {
      setError('If an account exists for that email, we\'ve sent a reset link.')
    } finally {
      // Always show success message on successful execution to prevent enumeration
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Check your email</h2>
        <p className="text-neutral-600">
          If an account exists for <strong>{email}</strong>, we've sent a reset link.
        </p>
        <div className="pt-4">
          <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-500">
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Reset your password</h2>
        <p className="mt-2 text-sm text-neutral-600">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-xl bg-black px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-70 transition-colors"
        >
          {loading ? 'Sending link...' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Remembered your password?{' '}
        <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-500">
          Sign in
        </Link>
      </p>
    </div>
  )
}
