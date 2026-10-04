import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { aiChatRateLimit } from '@/lib/rate-limit'
import { GoogleGenAI, Type } from '@google/genai'
import { requireAdmin } from '@/lib/auth/require-admin'
import { updateOrderStatusAction } from '@/lib/actions/admin-orders'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const SYSTEM_PROMPT = `Step is an internal ops assistant for the Solecraft admin. It can report on store-wide data and take specific, narrow actions on orders. It must never claim an action succeeded without the tool call confirming it, and for any status-changing action, it should restate back what it's about to do in its own response before/as it does it, so the admin always sees what happened in plain language, not just a silent success.`

export async function POST(req: Request) {
  try {
    const { user: adminUser, supabase } = await requireAdmin()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { success } = await aiChatRateLimit.limit(adminUser.id)
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
          name: 'getOrderStats',
          description: 'Gets order counts and revenue over a time window.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              period: { type: Type.STRING, description: 'The time period to check: "today", "week", or "month"' }
            },
            required: ['period']
          }
        },
        {
          name: 'getLowStockProducts',
          description: 'Gets products where stock quantity is below a certain threshold.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              threshold: { type: Type.NUMBER, description: 'The stock threshold (default is 5)' }
            },
            required: []
          }
        },
        {
          name: 'getRecentOrders',
          description: 'Gets a list of the most recent orders.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              limit: { type: Type.NUMBER, description: 'Number of orders to retrieve (default is 10)' }
            },
            required: []
          }
        },
        {
          name: 'getCustomerCount',
          description: 'Gets the total number of unique customers.',
        },
        {
          name: 'updateOrderStatus',
          description: 'Updates the status of an order. E.g. "pending", "paid", "confirmed", "fulfilled", "failed", "cancelled", "refunded"',
          parameters: {
            type: Type.OBJECT,
            properties: {
              orderShortId: { type: Type.STRING, description: 'The 8-character short ID of the order' },
              newStatus: { type: Type.STRING, description: 'The new status to set' }
            },
            required: ['orderShortId', 'newStatus']
          }
        },
        {
          name: 'setOrderTracking',
          description: 'Sets tracking information for an order. Will also update shipped_at if this is the first time tracking is added.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              orderShortId: { type: Type.STRING, description: 'The 8-character short ID of the order' },
              carrier: { type: Type.STRING, description: 'Shipping carrier (e.g. TCS, Leopards, M&P, Other)' },
              trackingNumber: { type: Type.STRING, description: 'Tracking number provided by the carrier' },
              estimatedDelivery: { type: Type.STRING, description: 'Estimated delivery date in ISO format (YYYY-MM-DD)' }
            },
            required: ['orderShortId', 'carrier', 'trackingNumber']
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

    while (response.functionCalls && response.functionCalls.length > 0 && callCount < 5) {
      callCount++
      const functionCall = response.functionCalls[0]
      const name = functionCall.name
      const args = functionCall.args

      let result: any = null

      try {
        if (name === 'getOrderStats') {
          const { period } = args!
          const { data, error } = await supabase
            .rpc('get_admin_dashboard_stats', { p_period: period as string })
          if (error) throw error
          result = data
        } else if (name === 'getLowStockProducts') {
          const threshold = Number(args?.threshold || 5)
          const { data, error } = await supabase
            .from('product_sizes')
            .select('size, stock_quantity, sku, product:products(name, slug)')
            .lt('stock_quantity', threshold)
            .order('stock_quantity', { ascending: true })
            .limit(20)
          if (error) throw error
          result = data
        } else if (name === 'getRecentOrders') {
          const limit = Number(args?.limit || 10)
          const { data, error } = await supabase
            .from('orders')
            .select('id, short_id, status, total_amount, created_at, user_id, profiles(email, full_name)')
            .order('created_at', { ascending: false })
            .limit(limit)
          if (error) throw error
          result = data
        } else if (name === 'getCustomerCount') {
          const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
          if (error) throw error
          result = { count }
        } else if (name === 'updateOrderStatus') {
          const { data } = await supabase.from('orders').select('id').eq('short_id', args!.orderShortId).single()
          if (!data) throw new Error('Order not found')
          
          await updateOrderStatusAction(data.id, args!.newStatus as string)
          result = { success: true }
        } else if (name === 'setOrderTracking') {
          const { data } = await supabase.from('orders').select('id').eq('short_id', args!.orderShortId).single()
          if (!data) throw new Error('Order not found')
            
          await updateOrderStatusAction(data.id, undefined, {
            carrier: args!.carrier as string,
            trackingNumber: args!.trackingNumber as string,
            estimatedDelivery: args!.estimatedDelivery as string
          })
          result = { success: true }
        } else {
          throw new Error('Unknown function')
        }
      } catch (err: any) {
        result = { error: err.message || 'Function failed' }
      }

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
    console.error('Admin Chat error:', error)
    const errString = error?.message || String(error)
    if (error?.status === 429 || errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ reply: 'Step is getting a lot of questions right now — try again in a minute.' })
    }
    return NextResponse.json({ reply: 'Step is having trouble right now. Please try again later.' })
  }
}
