import ShopHero from '@/components/shop/ShopHero';
import CategoryTabs from '@/components/shop/CategoryTabs';
import FilterSidebar from '@/components/shop/FilterSidebar';
import ProductGrid from '@/components/shop/ProductGrid';
import Pagination from '@/components/shop/Pagination';
import PromoBanner from '@/components/shop/PromoBanner';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { createPublicClient } from '@/lib/supabase/public-client';
import { Metadata } from 'next';

import { mapProduct } from '@/lib/products/map-product';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Shop | Solecraft',
  description: 'Browse our complete collection of premium footwear at Solecraft. Find the perfect fit with our cutting-edge designs.',
  openGraph: {
    title: 'Shop | Solecraft',
    description: 'Browse our complete collection of premium footwear at Solecraft. Find the perfect fit with our cutting-edge designs.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop | Solecraft',
    description: 'Browse our complete collection of premium footwear at Solecraft. Find the perfect fit with our cutting-edge designs.',
  }
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams
  const category = resolvedSearchParams.category as string | undefined
  const sort = resolvedSearchParams.sort as string | undefined
  
  const supabase = createPublicClient()

  let query = supabase
    .from('products')
    .select(`*, product_images(*), product_sizes(*), product_colors(*)`, { count: 'exact' })
    .eq('is_active', true)

  if (category && category !== 'all') {
    if (category === 'limited') {
      query = query.eq('is_limited_edition', true)
    } else if (category === 'new') {
      query = query.eq('is_new', true)
    } else {
      query = query.eq('category', category)
    }
  }

  if (sort === 'Price: Low to High') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'Price: High to Low') {
    query = query.order('price', { ascending: false })
  } else if (sort === 'Newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    // Most popular could be based on rating or review_count or created_at for now
    query = query.order('rating', { ascending: false })
  }

  const { data, count, error } = await query

  const products = (data || []).map(mapProduct)

  return (
    <main className={`min-h-screen bg-white ${plusJakarta.className}`}>
      <ShopHero />
      <CategoryTabs />
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <FilterSidebar />
          <ProductGrid products={products} totalCount={count || 0} />
        </div>
        <Pagination />
        <PromoBanner />
      </div>
    </main>
  );
}
