import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function NotFound() {
  return (
    <main className={`min-h-[70vh] flex items-center justify-center bg-gray-50 px-6 py-24 sm:py-32 lg:px-8 ${plusJakarta.className}`}>
      <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full">
        <p className="text-base font-bold text-[#6C5CE7]">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#0f0f1a] sm:text-5xl">Page not found</h1>
        <p className="mt-6 text-base leading-7 text-gray-500">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or doesn't exist.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/shop"
            className="rounded-full bg-[#0f0f1a] px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2b2b36] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f0f1a] transition-all"
          >
            Back to Shop
          </Link>
          <Link href="/" className="text-sm font-semibold text-[#0f0f1a] hover:text-[#6C5CE7] transition-colors">
            Go home <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
