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
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          images: string[] | null
          category: string | null
          in_stock: boolean
          featured: boolean
          discount_percent: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          images?: string[] | null
          category?: string | null
          in_stock?: boolean
          featured?: boolean
          discount_percent?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          images?: string[] | null
          category?: string | null
          in_stock?: boolean
          featured?: boolean
          discount_percent?: number | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          status: string
          total_amount: number
          shipping_address: Json | null
          payment_intent_id: string | null
          payment_status: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          status?: string
          total_amount: number
          shipping_address?: Json | null
          payment_intent_id?: string | null
          payment_status?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          status?: string
          total_amount?: number
          shipping_address?: Json | null
          payment_intent_id?: string | null
          payment_status?: string | null
        }
      }
      collections: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          image_url: string | null
          slug: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          image_url?: string | null
          slug: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          image_url?: string | null
          slug?: string
          is_active?: boolean
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
