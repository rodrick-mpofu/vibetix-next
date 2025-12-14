export interface TicketTier {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  sold: number
  features: string[]
  color?: string
}

export interface EventData {
  id: string
  name: string
  type: string
  description: string
  startDate: string
  endDate?: string
  location?: string
  capacity: number
  ticketTiers: TicketTier[]
  pricingStrategy?: string
  uiConfig: UIConfig
  status: 'draft' | 'published' | 'cancelled' | 'completed'
}

export interface UIConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  layout: 'grid' | 'carousel' | 'list' | 'featured'
  theme: 'light' | 'dark' | 'vibrant' | 'elegant'
  typography: {
    headingFont: string
    bodyFont: string
  }
  spacing: 'compact' | 'comfortable' | 'spacious'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
}

export interface EventParseResult {
  eventSpec: {
    name: string
    type: string
    description: string
    startDate: string
    endDate?: string
    location?: string
    capacity: number
    suggestedTiers: Array<{
      name: string
      price: number
      quantity: number
      features: string[]
    }>
  }
  uiConfig: UIConfig
  pricingStrategy: string
}

export interface CheckoutItem {
  tierId: string
  quantity: number
  tierName: string
  price: number
}

export interface Order {
  id: string
  eventId: string
  customerEmail: string
  customerName: string
  totalAmount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
}

export interface Ticket {
  id: string
  orderId: string
  eventId: string
  tierId: string
  ticketNumber: string
  qrCode?: string
  checkedIn: boolean
}
