'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
          setUsername(data.username || '')
          setFullName(data.full_name || '')
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileSaving(true)

    try {
      // Check username uniqueness if changed
      if (username !== profile.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single()

        if (existing) {
          setProfileError('Username is already taken.')
          setProfileSaving(false)
          return
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, username, full_name: fullName })
      setProfileSuccess('Profile updated successfully.')
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.')
      return
    }

    setPasswordSaving(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error

      setPasswordSuccess('Password updated successfully.')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      
      {/* Profile Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-extrabold text-[#0f0f1a] mb-6">Profile Settings</h2>
        
        <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-[#0f0f1a] mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              title="Letters, numbers, and underscores only"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0f0f1a] mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0f0f1a] mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">
              Email changes will be enabled once email delivery is fully configured.
            </p>
          </div>

          {profileError && (
            <div className="p-4 bg-gray-50 text-[#0f0f1a] border-l-4 border-gray-800 rounded-r-lg text-sm font-semibold">
              {profileError}
            </div>
          )}
          
          {profileSuccess && (
            <div className="p-4 bg-gray-50 text-[#0f0f1a] border-l-4 border-[#6C5CE7] rounded-r-lg text-sm font-semibold">
              {profileSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="mt-2 w-full sm:w-auto self-start bg-[#0f0f1a] text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-extrabold text-[#0f0f1a] mb-6">Change Password</h2>
        
        <form onSubmit={handlePasswordSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-[#0f0f1a] mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0f0f1a] mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
            />
          </div>

          {passwordError && (
            <div className="p-4 bg-gray-50 text-[#0f0f1a] border-l-4 border-gray-800 rounded-r-lg text-sm font-semibold">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="p-4 bg-gray-50 text-[#0f0f1a] border-l-4 border-[#6C5CE7] rounded-r-lg text-sm font-semibold">
              {passwordSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="mt-2 w-full sm:w-auto self-start bg-[#0f0f1a] text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>

    </div>
  )
}
