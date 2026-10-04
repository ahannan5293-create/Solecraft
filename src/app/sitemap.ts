import { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public-client';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true);

  const baseUrl = 'https://solecraft.com';

  const productEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    }
  ];

  return [...staticEntries, ...productEntries];
}
