import React from 'react'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0f0f1a] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0f0f1a]">Add New Product</h1>
        <p className="text-gray-500 mt-1">Create a new product listing in your store.</p>
      </div>

      <ProductForm />
    </div>
  )
}
