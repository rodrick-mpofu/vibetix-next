import { z } from 'zod'

export const EventDescriptionSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
  userId: z.string().optional() // Optional for backwards compatibility
})

export const CreateEventSchema = z.object({
  name: z.string().min(3),
  type: z.string().min(3),
  description: z.string().min(10),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive(),
  hostEmail: z.string().email(),
  tiers: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().nonnegative(),
    quantity: z.number().int().positive(),
    features: z.array(z.string())
  })).min(1),
  uiConfig: z.object({
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background: z.string()
    }),
    layout: z.enum(['grid', 'carousel', 'list', 'featured']),
    theme: z.enum(['light', 'dark', 'vibrant', 'elegant']),
    typography: z.object({
      headingFont: z.string(),
      bodyFont: z.string()
    }),
    spacing: z.enum(['compact', 'comfortable', 'spacious']),
    borderRadius: z.enum(['none', 'small', 'medium', 'large'])
  }),
  pricingStrategy: z.string().optional()
})

export const RefineEventSchema = z.object({
  currentEventSpec: z.any(), // EventParseResult - using any to avoid circular dependency
  feedback: z.string().min(5, 'Feedback must be at least 5 characters'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
  userId: z.string().optional() // Optional for backwards compatibility
})

export const CreateCheckoutSessionSchema = z.object({
  eventId: z.string().uuid(),
  items: z.array(z.object({
    tierId: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).optional()
})

export type EventDescriptionInput = z.infer<typeof EventDescriptionSchema>
export type RefineEventInput = z.infer<typeof RefineEventSchema>
export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>
