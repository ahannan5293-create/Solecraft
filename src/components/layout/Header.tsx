'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import HeaderClient from './HeaderClient'
import GlobalAuthCheck from '@/components/auth/GlobalAuthCheck'

export default function Header() {
  const [user, setUser] = useState<any>(undefined)
  const [profile, setProfile] = useState<any>(undefined)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!mounted) return
      
      if (authUser) {
        setUser(authUser)
        const { data } = await supabase
          .from('profiles')
          .select('username, username_chosen')
          .eq('id', authUser.id)
          .single()
        if (mounted) setProfile(data)
      } else {
        setUser(null)
        setProfile(null)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        if (session?.user) {
          loadUser()
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <>
      {profile !== undefined && <GlobalAuthCheck profile={profile} />}
      <HeaderClient user={user} profile={profile} />
    </>
  )
}
