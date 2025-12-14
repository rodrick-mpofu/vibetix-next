import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2, CreditCard, Mail, User } from 'lucide-react'
import type { TicketTier } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFlowProps {
  eventId: string
  eventName: string
  selectedTier: TicketTier
}

export function CheckoutFlow({ eventId, eventName, selectedTier }: CheckoutFlowProps) {
  const [quantity, setQuantity] = useState(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = selectedTier.price * quantity
  const available = selectedTier.quantity - selectedTier.sold

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !name) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          items: [
            {
              tierId: selectedTier.id,
              quantity
            }
          ],
          customerEmail: email,
          customerName: name
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process checkout')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>

          <div className="space-y-4 mb-6">
            <div>
              <div className="text-sm text-slate-500 mb-1">Event</div>
              <div className="font-semibold text-slate-900">{eventName}</div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">Ticket Tier</div>
              <div className="font-semibold text-slate-900">{selectedTier.name}</div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">Features</div>
              <ul className="space-y-1">
                {selectedTier.features.map((feature, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Price per ticket</span>
              <span className="font-medium text-slate-900">${selectedTier.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Quantity</span>
              <span className="font-medium text-slate-900">{quantity}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4">
              <span className="text-slate-900">Total</span>
              <span className="text-cyan-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Checkout</h2>

          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Tickets
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-slate-300 hover:border-cyan-500 hover:bg-cyan-50 transition-colors flex items-center justify-center font-bold text-slate-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={available}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(available, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(available, quantity + 1))}
                  className="w-10 h-10 rounded-lg border-2 border-slate-300 hover:border-cyan-500 hover:bg-cyan-50 transition-colors flex items-center justify-center font-bold text-slate-700"
                >
                  +
                </button>
                <span className="text-sm text-slate-500">
                  {available} available
                </span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Your tickets will be sent to this email
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !name}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment - ${total.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-500">
              Secure payment powered by Stripe
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
