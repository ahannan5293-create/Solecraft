import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CheckoutForm from '@/components/checkout/CheckoutForm'

export const metadata = {
  title: 'Checkout | SOLECRAFT',
  description: 'Complete your purchase securely.',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/checkout')
  }

  // Fetch saved addresses
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-extrabold text-[#0f0f1a] mb-8">Checkout</h1>
        <CheckoutForm initialAddresses={addresses || []} userId={user.id} />
      </div>
    </div>
  )
}
