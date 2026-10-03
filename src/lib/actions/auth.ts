'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { authRateLimit } from '../rate-limit'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().regex(/^[a-zA-Z0-9_]{3,20}$/),
})

const resetPasswordSchema = z.object({
  email: z.string().email(),
})

async function checkAuthRateLimit() {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || '127.0.0.1'
  const { success } = await authRateLimit.limit(ip)
  if (!success) {
    throw new Error('Too many attempts, please try again in a minute')
  }
}

export async function signInAction(formData: any) {
  const parsed = signInSchema.safeParse(formData)
  if (!parsed.success) throw new Error('Invalid input data')
  
  await checkAuthRateLimit()
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })
  if (error) {
    // Only return generic messages or let Supabase's safe messages pass through
    throw new Error(error.message)
  }
  return { success: true }
}

export async function signUpAction(formData: any) {
  const parsed = signUpSchema.safeParse(formData)
  if (!parsed.success) throw new Error('Invalid input data')

  await checkAuthRateLimit()
  const supabase = await createClient()

  // Pre-check username
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', parsed.data.username)
    .single()
    
  if (existingUser) {
    throw new Error('Username already taken.')
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username, full_name: '' },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) throw new Error(error.message)
  return { data }
}

export async function resetPasswordAction(email: string) {
  const parsed = resetPasswordSchema.safeParse({ email })
  if (!parsed.success) throw new Error('Invalid input data')

  await checkAuthRateLimit()
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/confirm`,
  })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

