import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY! // need admin to bypass RLS for testing? Actually RLS doesn't matter for the constraint check.
)

async function test() {
  const { data, error } = await supabase.from('orders').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    status: 'confirmed',
    subtotal: 1000,
    shipping_cost: 0,
    total: 1000,
    currency: 'PKR',
    shipping_address: {},
    contact_email: 'test@example.com'
  })
  console.log(JSON.stringify(error, null, 2))
}

test()
