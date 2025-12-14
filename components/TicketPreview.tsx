import { useState } from 'react'
import { Calendar, MapPin, Users, Check } from 'lucide-react'
import type { EventParseResult, TicketTier } from '@/types'

interface TicketPreviewProps {
  eventData: EventParseResult
  onSelectTier: (tier: TicketTier, eventId: string) => void
  onRefine?: () => void
  onPublish?: () => void
}

export function TicketPreview({ eventData, onSelectTier, onRefine, onPublish }: TicketPreviewProps) {
  const { eventSpec, uiConfig } = eventData
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleSelectTier = (tier: any) => {
    setSelectedTier(tier.name)
    // In preview mode, we need to convert to the format expected
    onSelectTier({
      id: tier.name.toLowerCase().replace(/\s+/g, '-'),
      name: tier.name,
      price: tier.price,
      quantity: tier.quantity,
      sold: 0,
      features: tier.features
    }, 'preview')
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl mb-8"
        style={{
          background: `linear-gradient(135deg, ${uiConfig.colors.primary} 0%, ${uiConfig.colors.secondary} 100%)`
        }}
      >
        <div className="px-8 py-12 text-white">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              {eventSpec.type.charAt(0).toUpperCase() + eventSpec.type.slice(1)}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{eventSpec.name}</h1>
            <p className="text-lg text-white/90 mb-6">{eventSpec.description}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(eventSpec.startDate)}</span>
              </div>
              {eventSpec.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{eventSpec.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{eventSpec.capacity} capacity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(onRefine || onPublish) && (
        <div className="flex gap-3 mb-8">
          {onRefine && (
            <button
              onClick={onRefine}
              className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:border-slate-400 hover:bg-slate-50 transition-all"
            >
              Refine Event
            </button>
          )}
          {onPublish && (
            <button
              onClick={onPublish}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Publish Event
            </button>
          )}
        </div>
      )}

      {/* Ticket Tiers */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Tickets</h2>

        <div
          className={`grid gap-6 ${
            uiConfig.layout === 'grid'
              ? 'md:grid-cols-2 lg:grid-cols-3'
              : uiConfig.layout === 'list'
              ? 'grid-cols-1'
              : 'md:grid-cols-2'
          }`}
        >
          {eventSpec.suggestedTiers.map((tier, index) => {
            const isPopular = index === 1 // Middle tier is popular
            const isSelected = selectedTier === tier.name

            return (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 ${
                  isSelected
                    ? 'border-cyan-500 ring-4 ring-cyan-500/20'
                    : isPopular
                    ? 'border-amber-400'
                    : 'border-slate-200 hover:border-slate-300'
                } ${isPopular ? 'scale-105 md:scale-110' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">${tier.price}</span>
                    <span className="text-slate-500">/ ticket</span>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 text-sm text-slate-500">
                  {tier.quantity - 0} of {tier.quantity} available
                </div>

                <button
                  onClick={() => handleSelectTier(tier)}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${uiConfig.colors.accent} 0%, ${uiConfig.colors.primary} 100%)`
                      : `linear-gradient(135deg, ${uiConfig.colors.primary} 0%, ${uiConfig.colors.secondary} 100%)`
                  }}
                  className="w-full py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {isSelected ? 'Selected' : 'Select Tier'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pricing Strategy */}
      {eventData.pricingStrategy && (
        <div className="bg-slate-100 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Pricing Strategy</h3>
          <p className="text-sm text-slate-600">{eventData.pricingStrategy}</p>
        </div>
      )}
    </div>
  )
}
