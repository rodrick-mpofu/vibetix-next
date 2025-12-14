export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          type: string
          description: string
          start_date: string
          end_date: string | null
          location: string | null
          capacity: number
          ui_config: Json
          pricing_strategy: string | null
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          host_email: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          type: string
          description: string
          start_date: string
          end_date?: string | null
          location?: string | null
          capacity: number
          ui_config?: Json
          pricing_strategy?: string | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          host_email: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          type?: string
          description?: string
          start_date?: string
          end_date?: string | null
          location?: string | null
          capacity?: number
          ui_config?: Json
          pricing_strategy?: string | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          host_email?: string
        }
      }
      ticket_tiers: {
        Row: {
          id: string
          created_at: string
          event_id: string
          name: string
          description: string | null
          price: number
          quantity: number
          sold: number
          features: Json
          color: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          name: string
          description?: string | null
          price: number
          quantity: number
          sold?: number
          features?: Json
          color?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          name?: string
          description?: string | null
          price?: number
          quantity?: number
          sold?: number
          features?: Json
          color?: string | null
          sort_order?: number
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          event_id: string
          customer_email: string
          customer_name: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          currency: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          event_id: string
          customer_email: string
          customer_name: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          event_id?: string
          customer_email?: string
          customer_name?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
        }
      }
      tickets: {
        Row: {
          id: string
          created_at: string
          order_id: string
          tier_id: string
          event_id: string
          ticket_number: string
          qr_code: string | null
          checked_in: boolean
          checked_in_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          tier_id: string
          event_id: string
          ticket_number: string
          qr_code?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          tier_id?: string
          event_id?: string
          ticket_number?: string
          qr_code?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
