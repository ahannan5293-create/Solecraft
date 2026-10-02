import React from 'react'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

import { notFound } from 'next/navigation'
import { mapProduct } from '@/lib/products/map-product'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_sizes(*),
      product_colors(*)
    `)
    .eq('id', id)
    .single()
    
  if (error || !data) {
    notFound()
  }
  
  const product = mapProduct(data)

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0f0f1a] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0f0f1a]">Edit Product</h1>
        <p className="text-gray-500 mt-1">Update product details for {product.name}.</p>
      </div>

      <ProductForm initialProduct={product} isEditing={true} />
    </div>
  )
}
