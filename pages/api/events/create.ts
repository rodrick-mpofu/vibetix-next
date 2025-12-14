import type { NextApiRequest, NextApiResponse } from 'next'
import { eventService } from '@/lib/services/event-service'
import { CreateEventSchema } from '@/lib/utils/validators'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const validation = CreateEventSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.issues
      })
    }

    const data = validation.data

    const event = await eventService.createEvent({
      name: data.name,
      type: data.type,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      capacity: data.capacity,
      hostEmail: data.hostEmail,
      tiers: data.tiers.map(tier => ({
        name: tier.name,
        description: tier.description,
        price: tier.price,
        quantity: tier.quantity,
        features: tier.features
      })),
      uiConfig: data.uiConfig,
      pricingStrategy: data.pricingStrategy
    })

    return res.status(201).json(event)
  } catch (error) {
    console.error('Error in create event API:', error)
    return res.status(500).json({
      error: 'Failed to create event',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
