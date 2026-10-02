'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, Heart, Settings, MapPin, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const navLinks = [
  { name: 'Overview', href: '/account', icon: User },
  { name: 'Orders', href: '/account/orders', icon: ShoppingBag },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { name: 'Settings', href: '/account/settings', icon: Settings },
]

export default function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Nav Links */}
      <nav className="flex-1 flex flex-col gap-1 text-sm font-semibold text-gray-500">
        
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/account' && pathname.startsWith(link.href))
          const Icon = link.icon
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                isActive 
                  ? 'bg-[#6C5CE7] text-white' 
                  : 'hover:bg-gray-50 hover:text-[#0f0f1a] text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {link.name}
            </Link>
          )
        })}

        <div className="my-2 border-t border-gray-100" />
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50 hover:text-gray-900 w-full text-left"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          Log Out
        </button>
      </nav>
    </div>
  )
}
