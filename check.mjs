import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data: orderData, error: orderError } = await supabase.from('orders').select('tracking_number, carrier, shipped_at, estimated_delivery, cancellation_requested, cancellation_requested_at').limit(1);
  if (orderError) {
    console.error('Orders table check failed:', orderError.message);
  } else {
    console.log('Orders table check passed! Columns exist.');
  }

  const { data: addressData, error: addressError } = await supabase.from('addresses').select('id, user_id, is_default, line1, line2, city, state, postal_code, country, label, full_name, phone').limit(1);
  if (addressError) {
    console.error('Addresses table check failed:', addressError.message);
  } else {
    console.log('Addresses table check passed! Table and columns exist.');
  }
}
checkSchema();
