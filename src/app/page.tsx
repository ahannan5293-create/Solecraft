import HomeHero from '@/components/home/HomeHero';
import FeaturesStrip from '@/components/home/FeaturesStrip';
import ShopByCategory from '@/components/home/ShopByCategory';
import TopPicks from '@/components/home/TopPicks';
import PromoBanner from '@/components/shop/PromoBanner';
import WhySolecraft from '@/components/home/WhySolecraft';
import Testimonials from '@/components/home/Testimonials';
import Newsletter from '@/components/home/Newsletter';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';

import { mapProduct } from '@/lib/products/map-product';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default async function HomePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(`*, product_images(*), product_sizes(*), product_colors(*)`)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(4);

  const products = (data || []).map(mapProduct);

  return (
    <main className={`min-h-screen bg-white ${plusJakarta.className}`}>
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
