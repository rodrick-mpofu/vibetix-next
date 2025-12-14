import type { NextApiRequest, NextApiResponse } from 'next'
import { eventService } from '@/lib/services/event-service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid event ID' })
    }

    const event = await eventService.getEventById(id)

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    return res.status(200).json(event)
  } catch (error) {
    console.error('Error in get event API:', error)
    return res.status(500).json({
      error: 'Failed to get event',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
