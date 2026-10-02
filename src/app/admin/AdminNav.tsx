'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users,
  Settings,
  Bell,
  ChevronDown,
  ChevronUp,
  LogOut,
  LineChart
} from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()
  const [productsOpen, setProductsOpen] = useState(pathname.startsWith('/admin/products'))

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-gray-100 shrink-0">
        <Link href="/admin" className="text-[#0f0f1a] font-extrabold text-2xl tracking-[0.15em] uppercase">
          Solecraft
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-1 text-sm font-semibold text-gray-500">
        
        {/* Dashboard */}
        <Link 
          href="/admin" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            pathname === '/admin' ? 'bg-[#f4f2ff] text-[#6C5CE7]' : 'hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${pathname === '/admin' ? 'text-[#6C5CE7]' : 'text-gray-400'}`} />
          Dashboard
        </Link>

        {/* Products (Expandable) */}
        <div className="flex flex-col">
          <button 
            onClick={() => setProductsOpen(!productsOpen)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
              pathname.startsWith('/admin/products') ? 'text-[#6C5CE7]' : 'hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className={`w-5 h-5 ${pathname.startsWith('/admin/products') ? 'text-[#6C5CE7]' : 'text-gray-400'}`} />
              Products
            </div>
            {productsOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          
          {productsOpen && (
            <div className="pl-12 pr-4 py-2 flex flex-col gap-1">
              <Link 
                href="/admin/products"
                className={`block px-4 py-2.5 rounded-xl transition-colors ${
                  pathname === '/admin/products' || pathname.startsWith('/admin/products/new') || pathname.includes('/edit')
                    ? 'bg-[#f4f2ff] text-[#6C5CE7]' 
                    : 'hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Product List
              </Link>
              <span className="block px-4 py-2.5 rounded-xl opacity-50 cursor-not-allowed">
                Categories
              </span>
            </div>
          )}
        </div>

        {/* Sales/Orders */}
        <Link 
          href="/admin/orders" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            pathname.startsWith('/admin/orders') ? 'bg-[#f4f2ff] text-[#6C5CE7]' : 'hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${pathname.startsWith('/admin/orders') ? 'text-[#6C5CE7]' : 'text-gray-400'}`} />
          Orders
        </Link>

        {/* Customers */}
        <Link 
          href="/admin/customers" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            pathname.startsWith('/admin/customers') ? 'bg-[#f4f2ff] text-[#6C5CE7]' : 'hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Users className={`w-5 h-5 ${pathname.startsWith('/admin/customers') ? 'text-[#6C5CE7]' : 'text-gray-400'}`} />
          Customers
        </Link>

        {/* Analytics */}
        <span className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-50 cursor-not-allowed">
          <LineChart className="w-5 h-5 text-gray-400" />
          Analytics
        </span>

        {/* Notifications */}
        <span className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-50 cursor-not-allowed">
          <Bell className="w-5 h-5 text-gray-400" />
          Notifications
        </span>

        {/* Settings */}
        <span className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-50 cursor-not-allowed mb-auto">
          <Settings className="w-5 h-5 text-gray-400" />
          Settings
        </span>

        <div className="my-2 border-t border-gray-100" />
        
        <Link
          href="/account"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50 hover:text-gray-900 mt-2"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          Exit Admin
        </Link>
      </nav>
    </div>
  )
}
