import React from 'react'
import { requireUser } from '@/utils/auth'
import AccountNav from './AccountNav'
import StepChatWidget from '@/components/account/StepChatWidget'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser('/account')

  return (
    <div className="bg-[#f7f8fb] min-h-[calc(100vh-80px)] py-12">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0f0f1a]">My Account</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-28 shadow-sm">
              <AccountNav />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>

      </div>
      <StepChatWidget />
    </div>
  )
}
