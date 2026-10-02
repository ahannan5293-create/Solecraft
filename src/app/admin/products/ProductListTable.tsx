'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Product } from '@/lib/products/map-product'
import { formatPrice } from '@/lib/format'
import { Edit, Trash2, Loader2, Image as ImageIcon, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  initialProducts: Product[]
  currentPage: number
  totalPages: number
  currentCategory: string
  currentStatus: string
}

export default function ProductListTable({ 
  initialProducts, 
  currentPage, 
  totalPages,
  currentCategory,
  currentStatus
}: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'All') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selId => selId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone and will delete all associated images, sizes, and colors.')) {
      return
    }

    setLoadingId(id)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
      router.refresh()
    } catch (err) {
      console.error('Failed to delete product', err)
      alert('Failed to delete product')
    } finally {
      setLoadingId(null)
    }
  }

  const handleBulkAction = async (action: 'active' | 'inactive' | 'delete') => {
    if (selectedIds.length === 0) return
    
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return
    }

    setIsBulkLoading(true)
    try {
      if (action === 'delete') {
        const { error } = await supabase.from('products').delete().in('id', selectedIds)
        if (error) throw error
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)))
      } else {
        const isActive = action === 'active'
        const { error } = await supabase.from('products').update({ is_active: isActive }).in('id', selectedIds)
        if (error) throw error
        setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isActive } : p))
      }
      setSelectedIds([])
      router.refresh()
    } catch (err) {
      console.error('Bulk action failed', err)
      alert('Bulk action failed')
    } finally {
      setIsBulkLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Header & Bulk Actions */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
        
        {selectedIds.length > 0 ? (
          <div className="flex items-center gap-4 w-full">
            <span className="text-sm font-bold text-[#6C5CE7] bg-purple-50 px-3 py-1.5 rounded-lg">
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button 
                onClick={() => handleBulkAction('active')}
                disabled={isBulkLoading}
                className="text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                Set Active
              </button>
              <button 
                onClick={() => handleBulkAction('inactive')}
                disabled={isBulkLoading}
                className="text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                Set Inactive
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                disabled={isBulkLoading}
                className="text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900">Products list</h2>
            
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                  value={currentCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Running">Running</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Basketball">Basketball</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5">
                <select 
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                  value={currentStatus}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <Link 
                href="/admin/products/new"
                className="bg-[#6C5CE7] hover:bg-[#5b4cdb] text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-4 px-6 w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#6C5CE7] focus:ring-[#6C5CE7] cursor-pointer"
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const displayImg = product.images?.[0]?.url
                const totalStock = product.sizes?.reduce((sum, s) => sum + s.stockQuantity, 0) || 0
                const isSelected = selectedIds.includes(product.id)

                return (
                  <tr key={product.id} className={`transition-colors ${isSelected ? 'bg-purple-50/30' : 'hover:bg-gray-50/50'}`}>
                    <td className="py-4 px-6">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-[#6C5CE7] focus:ring-[#6C5CE7] cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                        {displayImg ? (
                          <Image src={displayImg} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.slug}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 capitalize">{product.category}</td>
                    <td className="py-4 px-4 text-sm font-bold text-gray-900">{formatPrice(product.price)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{totalStock} in stock</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {loadingId === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-2" />
                        ) : (
                          <>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-2 text-gray-400 hover:text-[#6C5CE7] hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <p className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
