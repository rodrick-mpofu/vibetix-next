import { useState } from 'react'
import { Ticket, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { EventChat } from '@/components/EventChat'
import { TicketPreview } from '@/components/TicketPreview'
import type { EventParseResult, TicketTier } from '@/types'

type AppState = 'chat' | 'preview' | 'refining'

export default function CreatePage() {
  const router = useRouter()
  const [state, setState] = useState<AppState>('chat')
  const [eventData, setEventData] = useState<EventParseResult | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleEventGenerated = (data: EventParseResult) => {
    setEventData(data)
    setState('preview')
  }

  const handleRefine = () => {
    setState('refining')
    // In a full implementation, this would open a chat to refine
    // For now, go back to chat
    setState('chat')
  }

  const handlePublish = async () => {
    if (!eventData) return

    setIsPublishing(true)

    try {
      // Create event in database
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventData.eventSpec.name,
          type: eventData.eventSpec.type,
          description: eventData.eventSpec.description,
          startDate: eventData.eventSpec.startDate,
          endDate: eventData.eventSpec.endDate,
          location: eventData.eventSpec.location,
          capacity: eventData.eventSpec.capacity,
          hostEmail: 'demo@vibetix.com', // In production, get from auth
          tiers: eventData.eventSpec.suggestedTiers.map(tier => ({
            name: tier.name,
            price: tier.price,
            quantity: tier.quantity,
            features: tier.features || []
          })),
          uiConfig: eventData.uiConfig,
          pricingStrategy: eventData.pricingStrategy
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const createdEvent = await response.json()

      // Redirect to event page
      router.push(`/events/${createdEvent.id}`)
    } catch (error) {
      console.error('Error publishing event:', error)
      alert('Failed to publish event. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleBack = () => {
    setState('chat')
  }

  const handleSelectTier = () => {
    // In preview mode, selecting a tier doesn't do anything
    // This is just for showing the design
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {state !== 'chat' && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors backdrop-blur-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-cyan-600" />
                </button>
              )}
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg shadow-lg">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">VibeTix</h1>
                  <p className="text-sm text-cyan-600">Create Your Event</p>
                </div>
              </Link>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm text-cyan-600 hover:bg-white/50 backdrop-blur-sm rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state === 'chat' && (
          <EventChat onEventGenerated={handleEventGenerated} />
        )}
        {state === 'preview' && eventData && (
          <TicketPreview
            eventData={eventData}
            onSelectTier={handleSelectTier}
            onRefine={handleRefine}
            onPublish={handlePublish}
          />
        )}
        {isPublishing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-slate-900">Publishing your event...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
