
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, product_images(id)');
    
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }
  
  const brokenProducts = products.filter(p => !p.product_images || p.product_images.length === 0);
  
  console.log(`Total products: ${products.length}`);
  console.log(`Products without images: ${brokenProducts.length}`);
  if (brokenProducts.length > 0) {
    console.log('Broken products:', brokenProducts.map(p => ({ id: p.id, name: p.name })));
  }
}

audit();
