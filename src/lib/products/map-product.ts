export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  category: 'men' | 'women' | 'kids' | 'unisex'
  price: number
  originalPrice: number | null
  badge: 'new' | 'bestseller' | 'sale' | null
  isNew: boolean
  isLimitedEdition: boolean
  rating: number | null
  reviewCount: number
  model3dUrl: string | null
  isActive: boolean
  images: { url: string; displayOrder: number; altText: string | null }[]
  sizes: { size: string; stockQuantity: number; sku: string | null }[]
  colors: { name: string; hex: string }[]
}

export function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price,
    badge: row.badge,
    isNew: row.is_new,
    isLimitedEdition: row.is_limited_edition,
    rating: row.rating,
    reviewCount: row.review_count,
    model3dUrl: row.model_3d_url,
    isActive: row.is_active,
    images: (row.product_images || []).map((img: any) => ({
      url: img.url,
      displayOrder: img.display_order,
      altText: img.alt_text,
    })).sort((a: any, b: any) => a.displayOrder - b.displayOrder),
    sizes: (row.product_sizes || []).map((size: any) => ({
      size: size.size,
      stockQuantity: size.stock_quantity,
      sku: size.sku,
    })),
    colors: (row.product_colors || []).map((color: any) => ({
      name: color.name,
      hex: color.hex,
    })),
  };
}
