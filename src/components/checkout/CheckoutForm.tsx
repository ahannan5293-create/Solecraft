'use client'

import React, { useState } from 'react'
import { useCart } from '@/components/cart/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import { MapPin, Loader2, Info, CreditCard, Banknote } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ENABLED_PAYMENT_METHODS, PaymentMethod } from '@/lib/config/checkout'

interface Address {
  id: string
  label: string | null
  full_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  is_default: boolean
}

interface CheckoutFormProps {
  initialAddresses: Address[]
  userId: string
}

export default function CheckoutForm({ initialAddresses, userId }: CheckoutFormProps) {
  const { items, subtotal } = useCart()
  const router = useRouter()
  
  const defaultAddress = initialAddresses.find(a => a.is_default) || initialAddresses[0]
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress?.id || '')
  
  const [contactPhone, setContactPhone] = useState(defaultAddress?.phone || '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(ENABLED_PAYMENT_METHODS[0])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // subtotal is already calculated by CartContext, we just compute shipping
  const shipping = subtotal >= 15000 ? 0 : 250
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-[#0f0f1a] mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/shop" className="bg-[#0f0f1a] text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAddressId) {
      setError('Please select a shipping address.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            size: item.size,
            quantity: item.quantity
          })),
          addressId: selectedAddressId,
          contactPhone,
          paymentMethod
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.redirectTo) {
        router.push(data.redirectTo)
      } else {
        throw new Error('No valid redirect URL provided.')
      }

    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
      
      {/* Left Col: Details */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Addresses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#0f0f1a] mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#6C5CE7]" /> Shipping Address
          </h2>
          
          {initialAddresses.length === 0 ? (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-4">You have no saved addresses.</p>
              <Link href="/account/addresses" className="text-[#6C5CE7] font-bold text-sm hover:underline">
                + Add New Address in Account Settings
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {initialAddresses.map(address => (
                <label 
                  key={address.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    selectedAddressId === address.id 
                      ? 'border-[#6C5CE7] bg-[#fcfbfff0]' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="address" 
                    className="mt-1 w-4 h-4 text-[#6C5CE7] border-gray-300 focus:ring-[#6C5CE7]"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-[#0f0f1a]">{address.full_name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}{address.state ? `, ${address.state}` : ''} {address.postal_code}
                    </p>
                  </div>
                </label>
              ))}
              
              <Link href="/account/addresses" className="inline-block mt-2 text-[#6C5CE7] font-bold text-sm hover:underline">
                + Manage Addresses
              </Link>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#0f0f1a] mb-6">Contact Information</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number {paymentMethod === 'cod' && <span className="text-red-500">*</span>}
            </label>
            <input 
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="0300 1234567"
              required={paymentMethod === 'cod'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-colors"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#0f0f1a] mb-6">Payment Method</h2>
          
          {ENABLED_PAYMENT_METHODS.length === 1 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 bg-[#fcfbfff0]">
              {ENABLED_PAYMENT_METHODS[0] === 'cod' ? (
                <Banknote className="w-6 h-6 text-[#6C5CE7]" />
              ) : (
                <CreditCard className="w-6 h-6 text-[#6C5CE7]" />
              )}
              <span className="font-bold text-[#0f0f1a]">
                Payment Method: {ENABLED_PAYMENT_METHODS[0] === 'cod' ? 'Cash on Delivery' : 'Pay with Card'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ENABLED_PAYMENT_METHODS.includes('card') && (
                <label 
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-colors text-center ${
                    paymentMethod === 'card' 
                      ? 'border-[#6C5CE7] bg-[#fcfbfff0]' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    className="sr-only"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-[#6C5CE7]' : 'text-gray-400'}`} />
                  <span className={`font-bold ${paymentMethod === 'card' ? 'text-[#0f0f1a]' : 'text-gray-500'}`}>Pay with Card</span>
                </label>
              )}

              {ENABLED_PAYMENT_METHODS.includes('cod') && (
                <label 
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-colors text-center ${
                    paymentMethod === 'cod' 
                      ? 'border-[#6C5CE7] bg-[#fcfbfff0]' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    className="sr-only"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <Banknote className={`w-8 h-8 ${paymentMethod === 'cod' ? 'text-[#6C5CE7]' : 'text-gray-400'}`} />
                  <span className={`font-bold ${paymentMethod === 'cod' ? 'text-[#0f0f1a]' : 'text-gray-500'}`}>Cash on Delivery</span>
                </label>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Right Col: Summary */}
      <div className="w-full md:w-[380px] shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
          <h2 className="text-xl font-bold text-[#0f0f1a] mb-6">Order Summary</h2>
          
          <div className="flex flex-col gap-4 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-[#f7f8fb] rounded-xl flex items-center justify-center p-2 shrink-0 relative">
                  <Image src={item.image || '/placeholder-image.png'} alt={item.name} fill className="object-contain p-1" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#0f0f1a] text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-500">Size {item.size} • Qty {item.quantity}</p>
                  <p className="font-bold text-[#0f0f1a] mt-1 text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 text-sm border-t border-gray-100 pt-6 mb-6">
            <div className="flex justify-between font-medium text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-500">
              <span>Shipping</span>
              {shipping === 0 ? (
                <span className="text-[#6C5CE7] font-bold">Free</span>
              ) : (
                <span>{formatPrice(shipping)}</span>
              )}
            </div>
            {shipping === 0 && (
              <div className="bg-purple-50 text-purple-700 text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                You qualified for free shipping!
              </div>
            )}
            <div className="flex justify-between items-end mt-4">
              <span className="font-bold text-[#0f0f1a]">Total</span>
              <span className="text-2xl font-extrabold text-[#0f0f1a]">{formatPrice(total)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedAddressId}
            className="w-full bg-[#0f0f1a] text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Place Order
          </button>
          
          <p className="text-xs text-center text-gray-400 mt-4 font-medium">
            {paymentMethod === 'card' 
              ? 'You will be redirected to Safepay to securely complete your payment.'
              : 'You will pay in cash upon receiving your order.'}
          </p>
        </div>
      </div>

    </form>
  )
}
