import HomeHero from '@/components/home/HomeHero';
import FeaturesStrip from '@/components/home/FeaturesStrip';
import ShopByCategory from '@/components/home/ShopByCategory';
import TopPicks from '@/components/home/TopPicks';
import PromoBanner from '@/components/shop/PromoBanner';
import WhySolecraft from '@/components/home/WhySolecraft';
import Testimonials from '@/components/home/Testimonials';
import Newsletter from '@/components/home/Newsletter';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { createPublicClient } from '@/lib/supabase/public-client';
import { Metadata } from 'next';

import { mapProduct } from '@/lib/products/map-product';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Home',
  description: 'Solecraft is a premium footwear brand combining advanced technology with minimalist design. Shop shoes engineered for comfort, performance, and everyday style in Pakistan.',
  alternates: { canonical: '/' },
};

export const revalidate = 300;

export default async function HomePage() {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from('products')
    .select(`*, product_images(*), product_sizes(*), product_colors(*)`)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(4);

  const products = (data || []).map(mapProduct);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Solecraft',
    url: 'https://solecraft.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://solecraft.com/shop?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Solecraft',
    description: 'Premium footwear brand combining advanced technology with minimalist design. Based in Pakistan.',
    url: 'https://solecraft.com',
    logo: 'https://solecraft.com/favicon.ico',
    currenciesAccepted: 'PKR',
    paymentAccepted: 'Cash on Delivery',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-300-1234567',
      contactType: 'customer service',
      availableLanguage: ['English', 'Urdu'],
    },
  };

  return (
    <main className={`min-h-screen bg-white ${plusJakarta.className}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteJsonLd, storeJsonLd]) }}
      />
      <HomeHero />
      <FeaturesStrip />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 flex flex-col gap-24">
        <ShopByCategory />
        <TopPicks products={products} />
        <PromoBanner />
        <WhySolecraft />
      </div>
      <div className="bg-white pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <Testimonials />
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24">
        <Newsletter />
      </div>
    </main>
  );
}
