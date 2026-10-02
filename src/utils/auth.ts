import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function requireUser(currentPath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  return { user, supabase }
}
