import Stripe from 'stripe'

// Lazy initialization to avoid errors during build time
let _stripe: Stripe | null = null

function getStripeClient(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined')
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    const client = getStripeClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})
