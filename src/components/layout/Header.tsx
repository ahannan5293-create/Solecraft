import { createClient } from '@/utils/supabase/server'
import HeaderClient from './HeaderClient'
import GlobalAuthCheck from '@/components/auth/GlobalAuthCheck'

export default async function Header() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let profile = null
  if (session) {
    const { data } = await supabase
      .from('profiles')
      .select('username, username_chosen')
      .eq('id', session.user.id)
      .single()
    profile = data
  }

  return (
    <>
      <GlobalAuthCheck profile={profile} />
      <HeaderClient user={session?.user || null} profile={profile} />
    </>
  )
}
