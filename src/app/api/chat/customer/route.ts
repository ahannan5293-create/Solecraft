import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { aiChatRateLimit } from '@/lib/rate-limit'
import { GoogleGenAI, Type } from '@google/genai'
import { requestCancellationAction } from '@/lib/actions/orders'
import { toggleWishlistAction } from '@/lib/actions/wishlist'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const SYSTEM_PROMPT = `Step is Solecraft's order assistant. It can answer questions about the CURRENT signed-in customer's own orders, wishlist, and general store policies (shipping, returns, COD). It must never claim knowledge of any other customer's data, never fabricate an order status, and must only report an action as successful after the corresponding tool call actually returns success.`

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success } = await aiChatRateLimit.limit(user.id)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { message, history } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const recentHistory = (history || []).slice(-10)

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood.' }] },
      ...recentHistory.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ]

    const tools = [{
      functionDeclarations: [
        {
          name: 'getMyOrders',
          description: 'Gets the current user\'s recent orders.',
        },
        {
          name: 'getOrderDetail',
          description: 'Gets detailed information about a specific order by its short ID.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              orderShortId: { type: Type.STRING, description: 'The 8-character short ID of the order' }
            },
            required: ['orderShortId']
          }
        },
        {
          name: 'getMyWishlist',
          description: 'Gets the products currently in the user\'s wishlist.',
        },
        {
          name: 'requestOrderCancellation',
          description: 'Requests cancellation of an order. Only works for pending orders.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              orderShortId: { type: Type.STRING, description: 'The 8-character short ID of the order' }
            },
            required: ['orderShortId']
          }
        },
        {
          name: 'toggleWishlistItem',
          description: 'Adds or removes a product from the user\'s wishlist.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              productSlug: { type: Type.STRING, description: 'The slug of the product to toggle' }
            },
            required: ['productSlug']
          }
        }
      ]
    }]

    let response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents,
      config: { tools: tools as any },
    })

    let callCount = 0

    // Handle tool calls
    while (response.functionCalls && response.functionCalls.length > 0 && callCount < 5) {
      callCount++
      const functionCall = response.functionCalls[0]
      const name = functionCall.name
      const args = functionCall.args

      let result: any = null

      try {
        if (name === 'getMyOrders') {
          const { data, error } = await supabase
            .from('orders')
            .select('id, short_id, status, total_amount, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
          
          if (error) throw error
          result = data
        } else if (name === 'getOrderDetail') {
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(name, slug))')
            .eq('short_id', args!.orderShortId)
            .single()
            
          if (error || !data) throw new Error('Order not found')
          if (data.user_id !== user.id) throw new Error('Unauthorized')
          
          result = data
        } else if (name === 'getMyWishlist') {
          const { data, error } = await supabase
            .from('wishlists')
            .select('product_id, products(name, slug, price)')
            .eq('user_id', user.id)
            
          if (error) throw error
          result = data.map((item: any) => item.products)
        } else if (name === 'requestOrderCancellation') {
          const { data } = await supabase
            .from('orders')
            .select('id, user_id')
            .eq('short_id', args!.orderShortId)
            .single()
            
          if (!data || data.user_id !== user.id) throw new Error('Order not found')
          
          const actionResult = await requestCancellationAction(data.id)
          result = actionResult
        } else if (name === 'toggleWishlistItem') {
          // get product id from slug
          const { data } = await supabase.from('products').select('id').eq('slug', args!.productSlug).single()
          if (!data) throw new Error('Product not found')
          
          const { data: existing } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id).eq('product_id', data.id).single()
          
          await toggleWishlistAction(data.id, !!existing)
          result = { success: true, isNowWishlisted: !existing }
        } else {
          throw new Error('Unknown function')
        }
      } catch (err: any) {
        result = { error: err.message || 'Function failed' }
      }

      // Append function response to contents and call model again
      contents.push({
        role: 'model',
        parts: [{ functionCall: { name, args } }]
      } as any)

      contents.push({
        role: 'user',
        parts: [{ functionResponse: { name, response: result } }]
      } as any)

      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { tools: tools as any },
      })
    }

    return NextResponse.json({ reply: response.text })

  } catch (error: any) {
    console.error('Chat error:', error)
    const errString = error?.message || String(error)
    if (error?.status === 429 || errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ reply: 'Step is getting a lot of questions right now — try again in a minute.' })
    }
    return NextResponse.json({ reply: 'Step is having trouble right now. Please try again later.' })
  }
}
