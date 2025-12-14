import { Ticket, Sparkles, Zap, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg shadow-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">VibeTix</h1>
                <p className="text-sm text-cyan-600">AI-Powered Event Ticketing</p>
              </div>
            </div>
            <Link
              href="/create"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Create Event
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Events That Vibe
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                With Your Vision
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Describe your event in plain English. AI generates custom interfaces, pricing strategies,
              and checkout experiences on-the-fly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-800 rounded-xl font-semibold hover:bg-white transition-all shadow-lg border border-slate-200"
            >
              See How It Works
            </a>
          </div>

          {/* Feature Cards */}
          <div id="features" className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI-Generated UI</h3>
              <p className="text-slate-600">
                Every event gets a unique interface tailored to its type, mood, and audience.
                No templates, just pure AI creativity.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Pricing</h3>
              <p className="text-slate-600">
                AI analyzes your event and suggests optimal pricing tiers with features
                that maximize revenue and sell-through.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real Payments</h3>
              <p className="text-slate-600">
                Integrated Stripe checkout with instant payouts. QR code tickets delivered
                automatically after purchase.
              </p>
            </div>
          </div>

          {/* Example Flow */}
          <div className="mt-20 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">See It In Action</h3>
            <div className="space-y-4 text-left max-w-3xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">You say:</p>
                  <p className="text-slate-600 italic">&quot;I&apos;m hosting a jazz concert for 200 people&quot;</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">AI generates:</p>
                  <p className="text-slate-600">✅ Custom event page with music theme</p>
                  <p className="text-slate-600">✅ 3 pricing tiers (General $45, Premium $75, VIP $120)</p>
                  <p className="text-slate-600">✅ Checkout flow with Stripe integration</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Result:</p>
                  <p className="text-slate-600">Your event is live in seconds. Start selling tickets immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-xl border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-600">
            Built for the Vibe Coding Hackathon • Powered by Claude AI & Stripe
          </p>
        </div>
      </footer>
    </div>
  )
}
