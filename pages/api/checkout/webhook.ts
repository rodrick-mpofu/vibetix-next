import type { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import { stripe } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { eventService } from '@/lib/services/event-service'
import { generateTicketNumber, generateTicketQRCode } from '@/lib/utils/qr-generator'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  let event

  try {
    const buf = await buffer(req)
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({
      error: 'Webhook signature verification failed'
    })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await handleCheckoutComplete(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        // Update order with payment intent
        await (supabaseAdmin
          .from('orders') as any)
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            status: 'paid'
          })
          .eq('stripe_checkout_session_id', paymentIntent.metadata.checkoutSessionId)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        await (supabaseAdmin
          .from('orders') as any)
          .update({ status: 'failed' })
          .eq('stripe_checkout_session_id', paymentIntent.metadata.checkoutSessionId)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleCheckoutComplete(session: any) {
  try {
    const orderId = session.metadata.orderId
    const eventId = session.metadata.eventId
    const items = JSON.parse(session.metadata.items)

    // Update order status
    await (supabaseAdmin
      .from('orders') as any)
      .update({
        status: 'paid',
        customer_email: session.customer_email || session.customer_details?.email,
        customer_name: session.customer_details?.name || 'Guest'
      } as any)
      .eq('id', orderId)

    // Create tickets for each item
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketNumber = generateTicketNumber()
        const qrCode = await generateTicketQRCode(ticketNumber, eventId)

        await (supabaseAdmin
          .from('tickets') as any)
          .insert({
            order_id: orderId,
            event_id: eventId,
            tier_id: item.tierId,
            ticket_number: ticketNumber,
            qr_code: qrCode
          })

        // Update tier sold count
        await eventService.updateTierSold(item.tierId, 1)
      }
    }

    console.log(`Successfully processed order ${orderId}`)
  } catch (error) {
    console.error('Error in handleCheckoutComplete:', error)
    throw error
  }
}
