const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((a, l) => {
  const [k, ...v] = l.split('=');
  if (k && v.length) a[k.trim()] = v.join('=').trim().replace(/\r$/, '').replace(/^"|"$/g, '');
  return a;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);

async function run() {
  console.log('sizes:', await supabase.from('product_sizes').select('size, stock_quantity').limit(5));
  console.log('colors:', await supabase.from('product_colors').select('*').limit(5));
  const { data: prices } = await supabase.from('products').select('price').eq('is_active', true);
  if (prices) {
    const p = prices.map(r => r.price);
    console.log('min price:', Math.min(...p), 'max price:', Math.max(...p));
  }
}
run();
