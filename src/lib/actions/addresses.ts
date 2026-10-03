'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { generalApiRateLimit } from '../rate-limit'

const addressSchema = z.object({
  full_name: z.string().min(1),
  phone: z.string().min(1),
  address_line1: z.string().min(1),
  address_line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().optional(),
  country: z.string().default('Pakistan'),
  label: z.string().optional(),
  is_default: z.boolean().optional(),
})

async function checkRateLimit(userId: string) {
  const { success } = await generalApiRateLimit.limit(userId)
  if (!success) throw new Error('Too many requests, please try again in a minute')
}

export async function createAddressAction(formData: any) {
  const parsed = addressSchema.safeParse(formData)
  if (!parsed.success) throw new Error('Invalid address data')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await checkRateLimit(user.id)

  const { error } = await supabase
    .from('addresses')
    .insert([{ ...parsed.data, user_id: user.id }])

  if (error) throw new Error('Failed to create address')
  revalidatePath('/account/addresses')
}

export async function updateAddressAction(id: string, formData: any) {
  const parsed = addressSchema.safeParse(formData)
  if (!parsed.success) throw new Error('Invalid address data')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await checkRateLimit(user.id)

  const { error } = await supabase
    .from('addresses')
    .update(parsed.data)
    .eq('id', id)
    // RLS scopes to owner

  if (error) throw new Error('Failed to update address')
  revalidatePath('/account/addresses')
}

export async function deleteAddressAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await checkRateLimit(user.id)

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)

  if (error) throw new Error('Failed to delete address')
  revalidatePath('/account/addresses')
}
