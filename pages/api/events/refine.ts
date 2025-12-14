import type { NextApiRequest, NextApiResponse } from 'next'
import { eventParserService } from '@/lib/ai/event-parser'
import { z } from 'zod'

const RefineEventSchema = z.object({
  currentEventSpec: z.any(),
  feedback: z.string().min(1),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const validation = RefineEventSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.issues
      })
    }

    const { currentEventSpec, feedback, conversationHistory } = validation.data

    const result = await eventParserService.refineEvent(
      currentEventSpec,
      feedback,
      conversationHistory
    )

    return res.status(200).json(result)
  } catch (error) {
    console.error('Error in refine API:', error)
    return res.status(500).json({
      error: 'Failed to refine event',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
