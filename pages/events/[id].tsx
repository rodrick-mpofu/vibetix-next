import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { Ticket, ArrowLeft, Loader2 } from 'lucide-react'
import { TicketPreview } from '@/components/TicketPreview'
import { eventService } from '@/lib/services/event-service'
import type { EventData, TicketTier } from '@/types'
import { useRouter } from 'next/router'

interface EventPageProps {
  event: EventData | null
  error?: string
}

export default function EventPage({ event: initialEvent, error }: EventPageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<EventData | null>(initialEvent)
  const [isPolling, setIsPolling] = useState(true)

  // Polling for real-time updates
  useEffect(() => {
    if (!event || !isPolling) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/events/${event.id}`)
        if (response.ok) {
          const updatedEvent = await response.json()
          setEvent(updatedEvent)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [event, isPolling])

  const handleSelectTier = (tier: TicketTier, eventId: string) => {
    // Navigate to checkout
    router.push({
      pathname: '/checkout',
      query: {
        eventId: event!.id,
        tierId: tier.id
      }
    })
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h1>
          <p className="text-slate-600 mb-4">{error || 'The event you're looking for doesn't exist.'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Convert EventData to EventParseResult format for TicketPreview
  const eventParseResult = {
    eventSpec: {
      name: event.name,
      type: event.type,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      capacity: event.capacity,
      suggestedTiers: event.ticketTiers.map(tier => ({
        name: tier.name,
        price: tier.price,
        quantity: tier.quantity,
        features: tier.features
      }))
    },
    uiConfig: event.uiConfig,
    pricingStrategy: event.pricingStrategy || ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg shadow-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">VibeTix</h1>
                <p className="text-sm text-cyan-600">Get Your Tickets</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {isPolling && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </div>
              )}
              <Link
                href="/create"
                className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                Create Event
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TicketPreview
          eventData={eventParseResult}
          onSelectTier={handleSelectTier}
        />
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string }

  try {
    const event = await eventService.getEventById(id)

    if (!event) {
      return {
        props: {
          event: null,
          error: 'Event not found'
        }
      }
    }

    return {
      props: {
        event: JSON.parse(JSON.stringify(event)) // Serialize for Next.js
      }
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    return {
      props: {
        event: null,
        error: 'Failed to load event'
      }
    }
  }
}
