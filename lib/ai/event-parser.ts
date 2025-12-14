import Anthropic from '@anthropic-ai/sdk'
import type { EventParseResult } from '@/types'
import { trackAIGeneration } from '@/lib/ai/usage-tracking'

// Lazy initialization to avoid errors during build time
let _anthropic: Anthropic | null = null

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }
    _anthropic = new Anthropic({ apiKey })
  }
  return _anthropic
}

const anthropic = new Proxy({} as Anthropic, {
  get(target, prop) {
    const client = getAnthropicClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export class EventParserService {
  async parseEventDescription(
    description: string,
    conversationHistory: ConversationMessage[] = [],
    userId?: string
  ): Promise<EventParseResult> {
    // Track AI usage BEFORE making the API call to enforce limits
    if (userId) {
      await trackAIGeneration(userId, 'event_parse');
    }
    const systemPrompt = `You are an expert event planning AI for VibeTix, a ticketing platform. Your job is to parse event descriptions and generate detailed event specifications with pricing tiers and UI configurations.

Given a user's event description, extract or infer:
1. Event name
2. Event type (concert, workshop, conference, festival, meetup, party, etc.)
3. Detailed description
4. Start date/time (if not specified, suggest tomorrow at 7 PM)
5. Capacity (number of attendees)
6. Location (if mentioned)
7. Suggested ticket tiers (usually 2-4 tiers with names, prices, quantities, and features)
8. UI configuration (colors, layout, theme based on event type)
9. Pricing strategy explanation

Be creative and thoughtful about pricing tiers. Consider:
- Event type and market positioning
- Capacity and expected demand
- Different value propositions for each tier
- Realistic pricing based on event type

For UI config, match the theme to the event:
- Concerts/Music: Vibrant, energetic colors
- Corporate/Professional: Clean, professional colors
- Festivals: Bright, multi-color themes
- Workshops: Calm, focused colors
- Parties: Fun, playful colors

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "eventSpec": {
    "name": "Event Name",
    "type": "event_type",
    "description": "Detailed description",
    "startDate": "ISO 8601 datetime",
    "endDate": "ISO 8601 datetime (optional)",
    "location": "Location (optional)",
    "capacity": 200,
    "suggestedTiers": [
      {
        "name": "Tier Name",
        "price": 50,
        "quantity": 100,
        "features": ["Feature 1", "Feature 2"]
      }
    ]
  },
  "uiConfig": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex"
    },
    "layout": "grid|carousel|list|featured",
    "theme": "light|dark|vibrant|elegant",
    "typography": {
      "headingFont": "font-name",
      "bodyFont": "font-name"
    },
    "spacing": "compact|comfortable|spacious",
    "borderRadius": "none|small|medium|large"
  },
  "pricingStrategy": "Explanation of pricing approach"
}`

    try {
      const messages: Anthropic.MessageParam[] = [
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: description
        }
      ]

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse the JSON response
      const parsed = JSON.parse(content.text) as EventParseResult

      // Validate the response has required fields
      if (!parsed.eventSpec || !parsed.uiConfig) {
        throw new Error('Invalid response format from Claude')
      }

      return parsed
    } catch (error) {
      console.error('Error parsing event description:', error)
      throw new Error('Failed to parse event description. Please try again with more details.')
    }
  }

  async refineEvent(
    currentEventSpec: EventParseResult,
    userFeedback: string,
    conversationHistory: ConversationMessage[] = [],
    userId?: string
  ): Promise<EventParseResult> {
    // Track AI usage BEFORE making the API call to enforce limits
    if (userId) {
      await trackAIGeneration(userId, 'ui_generation');
    }
    const systemPrompt = `You are refining an event specification based on user feedback.

Current event spec:
${JSON.stringify(currentEventSpec, null, 2)}

User wants to make changes. Parse their feedback and return an UPDATED event specification in the same JSON format.

Maintain consistency where the user hasn't requested changes. Only modify what the user asks for.

Return ONLY valid JSON (no markdown, no extra text).`

    try {
      const messages: Anthropic.MessageParam[] = [
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: userFeedback
        }
      ]

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      const parsed = JSON.parse(content.text) as EventParseResult

      if (!parsed.eventSpec || !parsed.uiConfig) {
        throw new Error('Invalid response format from Claude')
      }

      return parsed
    } catch (error) {
      console.error('Error refining event:', error)
      throw new Error('Failed to refine event. Please try again.')
    }
  }
}

export const eventParserService = new EventParserService()
