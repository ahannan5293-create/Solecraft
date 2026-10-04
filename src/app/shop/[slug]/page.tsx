import { createPublicClient } from '@/lib/supabase/public-client';
import { mapProduct } from '@/lib/products/map-product';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import { Metadata } from 'next';

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  
  const { data: productData } = await supabase
    .from('products')
    .select('name, description, product_images(url)')
    .eq('slug', slug)
    .single();

  if (!productData) {
    return { title: 'Product Not Found | Solecraft' };
  }

  const title = `${productData.name} | Solecraft`;
  const description = productData.description || `Shop the ${productData.name} at Solecraft. Premium footwear with cutting-edge design.`;
  const image = productData.product_images?.[0]?.url || 'https://solecraft.com/favicon.ico';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    }
  };
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

  const inStock = product.sizes && product.sizes.some(s => s.stockQuantity > 0);
  
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.description || `Shop the ${product.name} at Solecraft.`,
    sku: product.sizes?.[0]?.sku || undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'PKR',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://solecraft.com/shop/${product.slug}`,
    }
  };

  if (product.rating && product.reviewCount) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return (
    <main className="min-h-[80vh] bg-gray-50 pt-24 pb-16 flex items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-white w-full max-w-[1200px] mx-auto rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">
          <ProductGallery product={product} images={images} />
          <ProductInfo product={product} images={images} />
        </div>
      </div>
    </main>
  );
}
