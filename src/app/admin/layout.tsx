import React from 'react'
import { requireAdmin } from '@/lib/auth/require-admin'
import AdminNav from './AdminNav'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block fixed inset-y-0 left-0 z-10 border-r border-gray-200">
        <AdminNav />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
