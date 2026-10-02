import React from 'react'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

export const metadata = {
  title: 'Payment Cancelled | SOLECRAFT',
  description: 'Your payment was cancelled.',
}

export default function CheckoutFailedPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-12 flex items-center justify-center">
      <div className="max-w-xl w-full px-6">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-extrabold text-[#0f0f1a] mb-2">Payment Cancelled</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            You cancelled the payment or it failed. Your cart has been saved so you can try again when you're ready.
          </p>
          <Link 
            href="/checkout" 
            className="bg-[#0f0f1a] text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Return to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
