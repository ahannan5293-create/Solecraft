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
  title: 'Shop',
  description: 'Browse our complete collection of premium footwear at Solecraft. Filter by category, sort by price or rating, and find the perfect pair for your style.',
  alternates: { canonical: '/shop' },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams
  const category = resolvedSearchParams.category as string | undefined
  const sort = resolvedSearchParams.sort as string | undefined
  const sizesParam = resolvedSearchParams.size as string | string[] | undefined
  const selectedSizes = Array.isArray(sizesParam) ? sizesParam : (sizesParam ? sizesParam.split(',') : [])
  const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : 0
  const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : Infinity
  
  const supabase = createPublicClient()

  // 1. Fetch data for FilterSidebar
  const [
    { count: allCount },
    { count: menCount },
    { count: womenCount },
    { count: kidsCount },
    { count: limitedCount },
    { count: newCount },
    { data: allSizes },
    { data: allColors },
    { data: allPrices }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('category', 'men'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('category', 'women'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('category', 'kids'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_limited_edition', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_new', true),
    supabase.from('product_sizes').select('size, product_id').gt('stock_quantity', 0),
    supabase.from('product_colors').select('name, hex, product_id'),
    supabase.from('products').select('price').eq('is_active', true)
  ]);

  const categoriesData = [
    { id: 'all', label: 'All', count: allCount || 0 },
    { id: 'men', label: 'Men', count: menCount || 0 },
    { id: 'women', label: 'Women', count: womenCount || 0 },
    { id: 'kids', label: 'Kids', count: kidsCount || 0 },
    { id: 'limited', label: 'Limited Edition', count: limitedCount || 0 },
    { id: 'new', label: 'New Arrivals', count: newCount || 0 },
  ];

  const sizeCounts: Record<string, Set<string>> = {}
  if (allSizes) {
    allSizes.forEach((row: any) => {
      if (!sizeCounts[row.size]) sizeCounts[row.size] = new Set()
      sizeCounts[row.size].add(row.product_id)
    })
  }
  const sizesData = Object.entries(sizeCounts)
    .map(([size, pids]) => ({ id: size, label: size, count: pids.size }))
    .sort((a,b) => a.id.localeCompare(b.id))

  const colorSet: Record<string, string> = {}
  if (allColors) {
    allColors.forEach((row: any) => {
      colorSet[row.name] = row.hex
    })
  }
  const colorsData = Object.entries(colorSet).map(([name, hex]) => ({ id: name, name, hex }))

  const prices = (allPrices || []).map((p: any) => p.price)
  const actualMinPrice = prices.length > 0 ? Math.min(...prices) : 0
  const actualMaxPrice = prices.length > 0 ? Math.max(...prices) : Number.MAX_SAFE_INTEGER

  // 2. Fetch main product list
  const selectString = selectedSizes.length > 0 
    ? '*, product_images(*), product_sizes!inner(*), product_colors(*)'
    : '*, product_images(*), product_sizes(*), product_colors(*)'

  let query = supabase
    .from('products')
    .select(selectString, { count: 'exact' })
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

  const colorParam = resolvedSearchParams.color as string | undefined
  if (colorParam) {
    query = query.eq('product_colors.name', colorParam)
  }

  if (selectedSizes.length > 0) {
    query = query.in('product_sizes.size', selectedSizes)
  }
  
  if (minPrice > 0) {
    query = query.gte('price', minPrice)
  }
  if (maxPrice < Infinity && maxPrice !== Number.MAX_SAFE_INTEGER) {
    query = query.lte('price', maxPrice)
  }

  if (sort === 'Price: Low to High') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'Price: High to Low') {
    query = query.order('price', { ascending: false })
  } else if (sort === 'Newest') {
    query = query.order('created_at', { ascending: false })
  } else {
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
          <FilterSidebar 
            categories={categoriesData} 
            sizes={sizesData} 
            colors={colorsData}
            minPriceBound={actualMinPrice}
            maxPriceBound={actualMaxPrice}
          />
          <ProductGrid products={products} totalCount={count || 0} />
        </div>
        <Pagination />
        <PromoBanner />
      </div>
    </main>
  );
}
