import { createPublicClient } from '@/lib/supabase/public-client';
import { mapProduct } from '@/lib/products/map-product';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';

export const revalidate = 300;

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data: products } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true);
    
  return (products || []).map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();
  
  const { data: productData, error } = await supabase
    .from('products')
    .select('*, product_images(*), product_sizes(*), product_colors(*)')
    .eq('slug', slug)
    .single();

  if (error || !productData || !productData.is_active) {
    notFound();
  }

  const product = mapProduct(productData);
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.url) 
    : ['/assets/images/shop/sneaker.png'];

  return (
    <main className="min-h-[80vh] bg-gray-50 pt-24 pb-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-white w-full max-w-[1200px] mx-auto rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">
          <ProductGallery product={product} images={images} />
          <ProductInfo product={product} images={images} />
        </div>
      </div>
    </main>
  );
}
