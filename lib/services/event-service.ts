import { supabaseAdmin } from '@/lib/supabase/admin'
import type { EventData, TicketTier } from '@/types'
import type { Database } from '@/types/supabase'

type EventRow = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
type TierRow = Database['public']['Tables']['ticket_tiers']['Row']
type TierInsert = Database['public']['Tables']['ticket_tiers']['Insert']

export class EventService {
  async createEvent(data: {
    name: string
    type: string
    description: string
    startDate: string
    endDate?: string
    location?: string
    capacity: number
    hostEmail: string
    tiers: Array<{
      name: string
      description?: string
      price: number
      quantity: number
      features: string[]
      color?: string
    }>
    uiConfig: any
    pricingStrategy?: string
  }): Promise<EventData> {
    try {
      // Insert event
      const eventInsert: EventInsert = {
        name: data.name,
        type: data.type,
        description: data.description,
        start_date: data.startDate,
        end_date: data.endDate,
        location: data.location,
        capacity: data.capacity,
        host_email: data.hostEmail,
        ui_config: data.uiConfig,
        pricing_strategy: data.pricingStrategy,
        status: 'published'
      }

      const { data: eventData, error: eventError } = await supabaseAdmin
        .from('events')
        .insert(eventInsert)
        .select()
        .single()

      if (eventError) {
        console.error('Event creation error:', eventError)
        throw new Error(`Failed to create event: ${eventError.message}`)
      }

      // Insert ticket tiers
      const tierInserts: TierInsert[] = data.tiers.map((tier, index) => ({
        event_id: eventData.id,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        quantity: tier.quantity,
        features: tier.features,
        color: tier.color,
        sort_order: index
      }))

      const { data: tiersData, error: tiersError } = await supabaseAdmin
        .from('ticket_tiers')
        .insert(tierInserts)
        .select()

      if (tiersError) {
        console.error('Tiers creation error:', tiersError)
        throw new Error(`Failed to create ticket tiers: ${tiersError.message}`)
      }

      return this.mapEventRowToEventData(eventData, tiersData)
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  async getEventById(eventId: string): Promise<EventData | null> {
    try {
      const { data: eventData, error: eventError } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError || !eventData) {
        return null
      }

      const { data: tiersData, error: tiersError } = await supabaseAdmin
        .from('ticket_tiers')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true })

      if (tiersError) {
        throw tiersError
      }

      return this.mapEventRowToEventData(eventData, tiersData || [])
    } catch (error) {
      console.error('Error getting event:', error)
      throw error
    }
  }

  async getEventsByHost(hostEmail: string): Promise<EventData[]> {
    try {
      const { data: eventsData, error: eventsError } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('host_email', hostEmail)
        .order('created_at', { ascending: false })

      if (eventsError) {
        throw eventsError
      }

      const events = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: tiersData } = await supabaseAdmin
            .from('ticket_tiers')
            .select('*')
            .eq('event_id', event.id)
            .order('sort_order', { ascending: true })

          return this.mapEventRowToEventData(event, tiersData || [])
        })
      )

      return events
    } catch (error) {
      console.error('Error getting events by host:', error)
      throw error
    }
  }

  async updateTierSold(tierId: string, quantity: number): Promise<void> {
    try {
      const { data: tier } = await supabaseAdmin
        .from('ticket_tiers')
        .select('sold')
        .eq('id', tierId)
        .single()

      const newSold = (tier?.sold || 0) + quantity

      const { error } = await supabaseAdmin
        .from('ticket_tiers')
        .update({ sold: newSold })
        .eq('id', tierId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating tier sold count:', error)
      throw error
    }
  }

  private mapEventRowToEventData(
    event: EventRow,
    tiers: TierRow[]
  ): EventData {
    return {
      id: event.id,
      name: event.name,
      type: event.type,
      description: event.description,
      startDate: event.start_date,
      endDate: event.end_date || undefined,
      location: event.location || undefined,
      capacity: event.capacity,
      ticketTiers: tiers.map(tier => ({
        id: tier.id,
        name: tier.name,
        description: tier.description || undefined,
        price: Number(tier.price),
        quantity: tier.quantity,
        sold: tier.sold,
        features: Array.isArray(tier.features) ? tier.features as string[] : [],
        color: tier.color || undefined
      })),
      pricingStrategy: event.pricing_strategy || undefined,
      uiConfig: event.ui_config as any,
      status: event.status
    }
  }
}

export const eventService = new EventService()
