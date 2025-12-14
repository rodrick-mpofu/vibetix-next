import { useEffect, useState } from 'react'
import { CheckCircle2, Download, Mail, Calendar } from 'lucide-react'
import type { Ticket } from '@/types'

interface PostPurchaseProps {
  sessionId: string
}

export function PostPurchase({ sessionId }: PostPurchaseProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    // In a real implementation, fetch order and ticket details from API
    // For now, we'll show a success message
    setIsLoading(false)
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Loading your tickets...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
        <p className="text-lg text-slate-600">
          Your tickets have been sent to your email
        </p>
      </div>

      {/* Order Confirmation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Order Confirmation</h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Check Your Email</div>
              <div className="text-sm text-slate-600">
                We've sent your tickets to your email address. Each ticket includes a unique QR code for entry.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Add to Calendar</div>
              <div className="text-sm text-slate-600">
                Don't forget to add this event to your calendar so you don't miss it!
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Download Tickets</div>
              <div className="text-sm text-slate-600">
                You can download your tickets as a PDF from the email we sent you.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 shadow-lg text-white">
        <h3 className="text-xl font-bold mb-4">What's Next?</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            <span>Check your email for the tickets with QR codes</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            <span>Save the QR codes on your phone or print them</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            <span>Show your QR code at the event entrance for check-in</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <a
          href="/"
          className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:border-slate-400 hover:bg-slate-50 transition-all text-center"
        >
          Browse More Events
        </a>
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-center"
        >
          Print Confirmation
        </button>
      </div>

      {/* Support */}
      <div className="mt-8 text-center text-sm text-slate-600">
        <p>
          Need help? Contact us at{' '}
          <a href="mailto:support@vibetix.com" className="text-cyan-600 hover:underline">
            support@vibetix.com
          </a>
        </p>
      </div>
    </div>
  )
}
