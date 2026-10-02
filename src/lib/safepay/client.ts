import crypto from 'crypto'

// Constants - Note: Verify exact header name and paths against Safepay docs
const SAFEPAY_SIGNATURE_HEADER = 'x-sfpy-signature'
const SAFEPAY_API_URL = process.env.SAFEPAY_ENV === 'production' 
  ? 'https://api.getsafepay.com' 
  : 'https://sandbox.api.getsafepay.com'

/**
 * Creates a Safepay checkout session/tracker.
 * 
 * IMPORTANT: VERIFY THIS SHAPE AGAINST LIVE SAFEPAY DOCS
 * The payload below assumes a hosted checkout integration standard payload.
 * Need to verify exact endpoint path (e.g., `/client/passport/v1/token` or `/checkout/v1/track`)
 * and payload fields before going to production.
 */
export async function createCheckoutSession(order: { id: string; total: number; currency: string; contactEmail: string }): Promise<{ checkoutUrl: string }> {
  const clientId = process.env.SAFEPAY_CLIENT_ID
  const secretKey = process.env.SAFEPAY_SECRET_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!clientId || !secretKey) {
    throw new Error('Safepay credentials are not configured.')
  }

  // NOTE: This assumes standard Safepay Token generation for Hosted Checkout.
  // We first generate a tracker/token.
  const response = await fetch(`${SAFEPAY_API_URL}/client/passport/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secretKey}` // Or however Safepay expects auth (sometimes it's X-SFPY-MERCHANT-SECRET)
    },
    body: JSON.stringify({
      client: clientId,
      amount: order.total,
      currency: order.currency,
      environment: process.env.SAFEPAY_ENV || 'sandbox'
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Failed to create Safepay checkout session: ${response.status} - ${errText}`)
  }

  const data = await response.json()
  const tracker = data?.data?.token // Assuming the token/tracker is returned here

  if (!tracker) {
    throw new Error('Malformed response from Safepay: missing tracker token.')
  }

  // Construct checkout URL (Hosted Checkout URL format)
  const checkoutUrl = `${SAFEPAY_API_URL.replace('api.', '')}/checkout/pay?env=${process.env.SAFEPAY_ENV || 'sandbox'}&beacon=${tracker}&source=custom&order_id=${order.id}&redirect=${encodeURIComponent(`${siteUrl}/checkout/success`)}&cancel=${encodeURIComponent(`${siteUrl}/checkout/failed`)}`

  return { checkoutUrl }
}

/**
 * Verifies the HMAC-SHA256 signature from Safepay webhooks.
 * 
 * IMPORTANT: VERIFY HEADER NAME (`x-sfpy-signature`) AGAINST LIVE DOCS
 */
export function verifySafepayWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false

  const secret = process.env.SAFEPAY_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('SAFEPAY_WEBHOOK_SECRET is not configured.')
  }

  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(rawBody)
    const expectedSignature = hmac.digest('hex')

    // Using timingSafeEqual to prevent timing attacks
    // We convert both to Buffers to compare safely
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8')
    const actualBuffer = Buffer.from(signatureHeader, 'utf-8')

    if (expectedBuffer.length !== actualBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}
