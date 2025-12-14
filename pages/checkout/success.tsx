import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Ticket } from 'lucide-react'
import { PostPurchase } from '@/components/PostPurchase'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { session_id } = router.query

  if (!session_id || typeof session_id !== 'string') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Session</h1>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg mt-4"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg shadow-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">VibeTix</h1>
              <p className="text-sm text-cyan-600">Order Confirmed</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostPurchase sessionId={session_id} />
      </main>
    </div>
  )
}
