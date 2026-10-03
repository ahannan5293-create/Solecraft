'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAddressAction(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('addresses')
    .insert([{ ...formData, user_id: user.id }])

  if (error) throw error
  revalidatePath('/account/addresses')
}

export async function updateAddressAction(id: string, formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('addresses')
    .update(formData)
    .eq('id', id)
    // RLS scopes to owner

  if (error) throw error
  revalidatePath('/account/addresses')
}

export async function deleteAddressAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/account/addresses')
}
