import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://solecraft.com'),
  title: {
    default: 'Solecraft — Premium Footwear, Engineered for You',
    template: '%s | Solecraft',
  },
  description: 'Solecraft is a premium footwear brand combining advanced technology with minimalist design. Shop shoes engineered for comfort, performance, and everyday style.',
  openGraph: {
    siteName: 'Solecraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import CartPanel from "@/components/cart/CartPanel";
import { QuickViewProvider } from "@/components/product/QuickViewContext";
import QuickViewModal from "@/components/product/QuickViewModal";
import { WishlistProvider } from "@/components/wishlist/WishlistContext";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WishlistProvider>
          <CartProvider>
            <QuickViewProvider>
              <Header />
              <div className="flex-1">
                {children}
              </div>
              <Footer />
              <CartPanel />
              <QuickViewModal />
            </QuickViewProvider>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
