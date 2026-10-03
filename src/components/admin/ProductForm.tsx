'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/products/map-product'
import { createClient } from '@/utils/supabase/client'
import { Plus, X, Upload, Loader2, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface ProductFormProps {
  initialProduct?: Product
  isEditing?: boolean
}

export default function ProductForm({ initialProduct, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // Base fields
  const [name, setName] = useState(initialProduct?.name || '')
  const [slug, setSlug] = useState(initialProduct?.slug || '')
  const [description, setDescription] = useState(initialProduct?.description || '')
  const [category, setCategory] = useState(initialProduct?.category || 'men')
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '')
  const [originalPrice, setOriginalPrice] = useState(initialProduct?.originalPrice?.toString() || '')
  const [badge, setBadge] = useState(initialProduct?.badge || 'none')
  const [isNew, setIsNew] = useState(initialProduct?.isNew || false)
  const [isLimitedEdition, setIsLimitedEdition] = useState(initialProduct?.isLimitedEdition || false)

  // Complex fields
  const [images, setImages] = useState<{ url: string, altText: string, file?: File }[]>(
    initialProduct?.images?.map(i => ({ url: i.url, altText: i.altText || '' })) || []
  )
  const [sizes, setSizes] = useState<{ size: string, stockQuantity: number, sku: string }[]>(
    initialProduct?.sizes?.map(s => ({ size: s.size, stockQuantity: s.stockQuantity, sku: s.sku || '' })) || []
  )
  const [colors, setColors] = useState<{ name: string, hex: string }[]>(
    initialProduct?.colors || []
  )
  const [modelUrl, setModelUrl] = useState(initialProduct?.model3dUrl || '')
  const [modelFile, setModelFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Two-step logic: we need a productId to upload files if new
  const [productId, setProductId] = useState<string | null>(initialProduct?.id || null)

  const handleNameBlur = () => {
    if (!slug && name) {
      setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  const saveBaseProduct = async () => {
    const { z } = await import('zod')
    
    const productSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      slug: z.string().min(1, 'Slug is required'),
      description: z.string().nullable(),
      category: z.enum(['men', 'women', 'kids', 'unisex']),
      price: z.number().positive('Price must be positive'),
      original_price: z.number().positive().nullable(),
      badge: z.string().nullable(),
      is_new: z.boolean(),
      is_limited_edition: z.boolean(),
      model_3d_url: z.string().nullable(),
    })

    const payloadRaw = {
      name,
      slug,
      description: description || null,
      category,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      badge: badge === 'none' ? null : badge,
      is_new: isNew,
      is_limited_edition: isLimitedEdition,
      model_3d_url: modelUrl || null,
    }

    const parsed = productSchema.safeParse(payloadRaw)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return null
    }

    const payload = parsed.data

    if (productId) {
      const { error } = await supabase.from('products').update(payload).eq('id', productId)
      if (error) throw error
      return productId
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single()
      if (error) throw error
      setProductId(data.id)
      return data.id
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const id = await saveBaseProduct()
      if (!id) return // Validation failed

      const uploadedFiles: { bucket: string, path: string }[] = []
      let uploadFailed = false

      // Upload images
      const imagePayload: any[] = []
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (img.file) {
          const fileExt = img.file.name.split('.').pop()
          const fileName = `${id}/${Date.now()}-${i}.${fileExt}`
          const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, img.file)
          
          if (uploadError) {
            setError(`Image upload failed for ${img.file.name}: ${uploadError.message}`)
            uploadFailed = true
            break
          }
          
          uploadedFiles.push({ bucket: 'product-images', path: fileName })
          const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
          imagePayload.push({
            product_id: id,
            url: data.publicUrl,
            display_order: i,
            alt_text: img.altText || null
          })
        } else {
          imagePayload.push({
            product_id: id,
            url: img.url,
            display_order: i,
            alt_text: img.altText || null
          })
        }
      }

      // Upload 3D model
      let finalModelUrl = modelUrl
      if (!uploadFailed && modelFile) {
        const fileName = `${id}/${Date.now()}.glb`
        const { error: uploadError } = await supabase.storage.from('product-models').upload(fileName, modelFile)
        if (uploadError) {
          setError(`3D Model upload failed: ${uploadError.message}`)
          uploadFailed = true
        } else {
          uploadedFiles.push({ bucket: 'product-models', path: fileName })
          const { data } = supabase.storage.from('product-models').getPublicUrl(fileName)
          finalModelUrl = data.publicUrl
          await supabase.from('products').update({ model_3d_url: finalModelUrl }).eq('id', id)
        }
      }

      if (uploadFailed) {
        // Cleanup successful uploads
        for (const file of uploadedFiles) {
          await supabase.storage.from(file.bucket).remove([file.path])
        }
        setSaving(false)
        return
      }

      // Save complex data
      if (isEditing) {
        await Promise.all([
          supabase.from('product_images').delete().eq('product_id', id),
          supabase.from('product_sizes').delete().eq('product_id', id),
          supabase.from('product_colors').delete().eq('product_id', id)
        ])
      }

      if (imagePayload.length > 0) {
        const { error: imgErr } = await supabase.from('product_images').insert(imagePayload)
        if (imgErr) throw imgErr
      }

      if (sizes.length > 0) {
        const sizePayload = sizes.map(s => ({
          product_id: id,
          size: s.size,
          stock_quantity: s.stockQuantity,
          sku: s.sku || null
        }))
        const { error: sizeErr } = await supabase.from('product_sizes').insert(sizePayload)
        if (sizeErr) throw sizeErr
      }

      if (colors.length > 0) {
        const colorPayload = colors.map(c => ({
          product_id: id,
          name: c.name,
          hex: c.hex
        }))
        const { error: colorErr } = await supabase.from('product_colors').insert(colorPayload)
        if (colorErr) throw colorErr
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const objectUrl = URL.createObjectURL(file)
    setImages(prev => [...prev, { url: objectUrl, altText: '', file }])
    if (e.target) e.target.value = ''
  }

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    if (!file.name.endsWith('.glb')) {
      setError('Only .glb files are allowed for 3D models')
      return
    }
    setModelFile(file)
    setModelUrl(file.name)
    if (e.target) e.target.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border-l-4 border-red-500 font-semibold text-sm">
          {error}
        </div>
      )}

      {/* Base Info */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-6">
        <h2 className="text-xl font-extrabold text-[#0f0f1a]">Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} onBlur={handleNameBlur} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Slug *</label>
            <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value as "men" | "women" | "kids" | "unisex")} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]">
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Badge</label>
            <select value={badge} onChange={e => setBadge(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]">
              <option value="none">None</option>
              <option value="new">New</option>
              <option value="bestseller">Bestseller</option>
              <option value="sale">Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price (PKR) *</label>
            <input type="number" required value={price} onChange={e => setPrice(e.target.value)} step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Original Price (PKR)</label>
            <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]" />
          </div>
          <div className="flex items-center gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
              <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="rounded text-[#6C5CE7] focus:ring-[#6C5CE7]" />
              Is New
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
              <input type="checkbox" checked={isLimitedEdition} onChange={e => setIsLimitedEdition(e.target.checked)} className="rounded text-[#6C5CE7] focus:ring-[#6C5CE7]" />
              Is Limited Edition
            </label>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-6">
        <h2 className="text-xl font-extrabold text-[#0f0f1a]">Media</h2>
        
        {/* Images */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4">Images</label>
          <div className="flex flex-wrap gap-4 mb-4">
            {images.map((img, i) => (
              <div key={i} className="w-24 h-24 relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
                <Image src={img.url} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {i > 0 && (
                    <button type="button" onClick={() => {
                      const newImgs = [...images];
                      [newImgs[i-1], newImgs[i]] = [newImgs[i], newImgs[i-1]];
                      setImages(newImgs);
                    }} className="bg-white p-1 rounded hover:text-[#6C5CE7]"><ArrowUp className="w-3 h-3" /></button>
                  )}
                  {i < images.length - 1 && (
                    <button type="button" onClick={() => {
                      const newImgs = [...images];
                      [newImgs[i+1], newImgs[i]] = [newImgs[i], newImgs[i+1]];
                      setImages(newImgs);
                    }} className="bg-white p-1 rounded hover:text-[#6C5CE7]"><ArrowDown className="w-3 h-3" /></button>
                  )}
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="bg-white p-1 rounded text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
            
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors text-gray-400">
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-xs font-semibold">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <p className="text-xs text-gray-500">Note: Images will be uploaded when you click &quot;Create Product&quot;.</p>
        </div>

        {/* 3D Model */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">3D Model (.glb)</label>
          {modelUrl ? (
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
              <span className="text-sm font-medium text-gray-600 truncate mr-4">{modelUrl.split('/').pop()}</span>
              <button type="button" onClick={() => { setModelUrl(''); setModelFile(null); }} className="text-red-500 hover:text-red-700 text-sm font-bold">Remove</button>
            </div>
          ) : (
            <label className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors text-gray-500">
              <Upload className="w-5 h-5 mr-2" />
              <span className="font-semibold text-sm">Select GLB File</span>
              <input type="file" accept=".glb" className="hidden" onChange={handleModelUpload} />
            </label>
          )}
        </div>
      </div>

      {/* Sizes */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#0f0f1a]">Sizes & Inventory</h2>
          <button type="button" onClick={() => setSizes([...sizes, { size: '', stockQuantity: 0, sku: '' }])} className="text-sm font-bold text-[#6C5CE7] hover:text-[#5b4cdb] flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Size
          </button>
        </div>
        
        {sizes.map((size, idx) => (
          <div key={idx} className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Size *</label>
              <input type="text" required value={size.size} onChange={e => {
                const newSizes = [...sizes]; newSizes[idx].size = e.target.value; setSizes(newSizes);
              }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]" placeholder="e.g. US 9" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Stock *</label>
              <input type="number" required min="0" value={size.stockQuantity} onChange={e => {
                const newSizes = [...sizes]; newSizes[idx].stockQuantity = parseInt(e.target.value) || 0; setSizes(newSizes);
              }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">SKU</label>
              <input type="text" value={size.sku} onChange={e => {
                const newSizes = [...sizes]; newSizes[idx].sku = e.target.value; setSizes(newSizes);
              }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]" />
            </div>
            <button type="button" onClick={() => setSizes(sizes.filter((_, i) => i !== idx))} className="mb-2 p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {sizes.length === 0 && <p className="text-sm text-gray-500 italic">No sizes added.</p>}
      </div>

      {/* Colors */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#0f0f1a]">Colors</h2>
          <button type="button" onClick={() => setColors([...colors, { name: '', hex: '#000000' }])} className="text-sm font-bold text-[#6C5CE7] hover:text-[#5b4cdb] flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Color
          </button>
        </div>
        
        {colors.map((color, idx) => (
          <div key={idx} className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Color Name *</label>
              <input type="text" required value={color.name} onChange={e => {
                const newC = [...colors]; newC[idx].name = e.target.value; setColors(newC);
              }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]" placeholder="e.g. Midnight Blue" />
            </div>
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-600 mb-1">Hex Code *</label>
                <input type="text" required value={color.hex} onChange={e => {
                  const newC = [...colors]; newC[idx].hex = e.target.value; setColors(newC);
                }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]" placeholder="#000000" />
              </div>
              <input type="color" value={color.hex} onChange={e => {
                const newC = [...colors]; newC[idx].hex = e.target.value; setColors(newC);
              }} className="w-10 h-10 mt-[22px] rounded cursor-pointer border-0 p-0" />
            </div>
            <button type="button" onClick={() => setColors(colors.filter((_, i) => i !== idx))} className="mb-2 p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {colors.length === 0 && <p className="text-sm text-gray-500 italic">No colors added.</p>}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#0f0f1a] hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
