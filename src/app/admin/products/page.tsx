import React from 'react'
import { createClient } from '@/utils/supabase/server'
import ProductListTable from './ProductListTable'
import { mapProduct } from '@/lib/products/map-product'

export default async function AdminProductsPage(props: { searchParams?: Promise<any> }) {
  const searchParams = props.searchParams ? await props.searchParams : {}
  const supabase = await createClient()

  const page = parseInt(searchParams.page) || 1
  const limit = 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_sizes(*),
      product_colors(*)
    `, { count: 'exact' })
  
  if (searchParams.category && searchParams.category !== 'All') {
    query = query.eq('category', searchParams.category.toLowerCase())
  }
  
  if (searchParams.status && searchParams.status !== 'All') {
    query = query.eq('is_active', searchParams.status === 'Active')
  }

  const { data: rawProducts, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('[admin/products] query failed:', error.message, error.details, error.hint)
  }

  const products = (rawProducts || []).map(mapProduct)
  const totalPages = count ? Math.ceil(count / limit) : 1

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
      </div>
      {error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden py-20 flex flex-col items-center justify-center text-center px-4">
          <h3 className="text-lg font-bold text-[#0f0f1a] mb-2">Something went wrong loading products</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      ) : (
        <ProductListTable 
          initialProducts={products} 
          currentPage={page} 
          totalPages={totalPages} 
          currentCategory={searchParams.category || 'All'}
          currentStatus={searchParams.status || 'All'}
        />
      )}
    </div>
  )
}

