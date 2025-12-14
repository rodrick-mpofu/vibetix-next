import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe/client'
import { eventService } from '@/lib/services/event-service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CreateCheckoutSessionSchema } from '@/lib/utils/validators'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const validation = CreateCheckoutSessionSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.issues
      })
    }

    const { eventId, items, customerEmail, customerName } = validation.data

    // Get event details
    const event = await eventService.getEventById(eventId)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    // Build line items for Stripe
    const lineItems = items.map(item => {
      const tier = event.ticketTiers.find(t => t.id === item.tierId)
      if (!tier) {
        throw new Error(`Tier ${item.tierId} not found`)
      }

      // Check availability
      if (tier.sold + item.quantity > tier.quantity) {
        throw new Error(`Not enough tickets available for ${tier.name}`)
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${event.name} - ${tier.name}`,
            description: tier.description || `Ticket for ${event.name}`,
            metadata: {
              eventId: event.id,
              tierId: tier.id,
              eventName: event.name,
              tierName: tier.name
            }
          },
          unit_amount: Math.round(tier.price * 100) // Convert to cents
        },
        quantity: item.quantity
      }
    })

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      const tier = event.ticketTiers.find(t => t.id === item.tierId)!
      return sum + (tier.price * item.quantity)
    }, 0)

    // Create pending order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        event_id: eventId,
        customer_email: customerEmail || 'guest@vibetix.com',
        customer_name: customerName || 'Guest',
        total_amount: totalAmount,
        currency: 'usd',
        status: 'pending'
      } as any)
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/events/${eventId}`,
      metadata: {
        eventId: event.id,
        orderId: (order as any).id,
        items: JSON.stringify(items)
      }
    })

    // Update order with session ID
    await (supabaseAdmin
      .from('orders') as any)
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', (order as any).id)

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      orderId: (order as any).id
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
