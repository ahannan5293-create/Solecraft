'use client'
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaInstagram, FaXTwitter, FaYoutube, FaFacebookF } from 'react-icons/fa6';



export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-[#0f0f1a] font-extrabold text-2xl tracking-[0.15em] uppercase">
              Solecraft
            </Link>
          </div>


          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-[#f7f8fb] flex items-center justify-center text-gray-600 hover:text-[#6C5CE7] hover:bg-[#f4f2ff] transition-all">
              <FaInstagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#f7f8fb] flex items-center justify-center text-gray-600 hover:text-[#6C5CE7] hover:bg-[#f4f2ff] transition-all">
              <FaXTwitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#f7f8fb] flex items-center justify-center text-gray-600 hover:text-[#6C5CE7] hover:bg-[#f4f2ff] transition-all">
              <FaYoutube className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#f7f8fb] flex items-center justify-center text-gray-600 hover:text-[#6C5CE7] hover:bg-[#f4f2ff] transition-all">
              <FaFacebookF className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 border-t border-gray-100 flex flex-col-reverse lg:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-400">
            © 2025 Solecraft. All rights reserved.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Shipping
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
