'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, ShoppingCart, Menu, X, LogOut, Package } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import { createClient } from '@/utils/supabase/client';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Contact', href: '/contact' },
];

export default function HeaderClient({ user, profile }: { user: any, profile: any }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
;
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount, openPanel } = useCart();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-[#0f0f1a] font-extrabold text-xl tracking-[0.15em] uppercase">
              Solecraft
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex items-center justify-center gap-8 flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-sm font-semibold transition-colors relative py-2 ${
                    isActive ? 'text-[#6C5CE7]' : 'text-gray-600 hover:text-[#0f0f1a]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6C5CE7] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-5 justify-end">
            <button className="text-[#0f0f1a] hover:text-[#6C5CE7] transition-colors">
              <Search className="w-5 h-5" strokeWidth={2} />
            </button>
            
            <div className="relative">
              {user ? (
                <div>
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-[#0f0f1a] hover:text-[#6C5CE7] transition-colors focus:outline-none"
                  >
                    <User className="w-5 h-5" strokeWidth={2} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-neutral-100">
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <p className="text-sm text-neutral-500">Signed in as</p>
                          <p className="truncate text-sm font-bold text-neutral-900">{profile?.username || user.email}</p>
                        </div>
                        <Link
                          href="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="text-[#0f0f1a] hover:text-[#6C5CE7] transition-colors flex items-center">
                  <User className="w-5 h-5" strokeWidth={2} />
                </Link>
              )}
            </div>

            <button 
              onClick={openPanel}
              className="text-[#0f0f1a] hover:text-[#6C5CE7] transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#0f0f1a] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button 
              className="lg:hidden text-[#0f0f1a] ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-full shadow-lg">
          <nav className="flex flex-col py-4 px-6 gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-semibold transition-colors ${
                    isActive ? 'text-[#6C5CE7]' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
