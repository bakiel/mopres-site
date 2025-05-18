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
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          default_shipping_address: Json | null
          first_name: string | null
          id: string
          last_name: string | null
          marketing_consent: boolean | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          default_shipping_address?: Json | null
          first_name?: string | null
          id: string
          last_name?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          default_shipping_address?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      email_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          marketing_consent: boolean | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          marketing_consent?: boolean | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          marketing_consent?: boolean | null
          source?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          product_sku: string
          quantity: number
          size: string | null
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          product_sku: string
          quantity: number
          size?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          product_sku?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          order_ref: string
          payment_method: string
          payment_status: string
          shipping_address: Json
          shipping_fee: number
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          order_ref: string
          payment_method: string
          payment_status?: string
          shipping_address: Json
          shipping_fee: number
          status?: string
          total_amount: number
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          order_ref?: string
          payment_method?: string
          payment_status?: string
          shipping_address?: Json
          shipping_fee?: number
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          collection_id: string | null
          created_at: string | null
          description: string | null
          estimated_restock_date: string | null
          featured: boolean
          id: string
          images: string[] | null
          in_stock: boolean
          inventory_quantity: number
          name: string
          price: number
          sale_price: number | null
          sizes: string[] | null
          sku: string
          slug: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          estimated_restock_date?: string | null
          featured?: boolean
          id?: string
          images?: string[] | null
          in_stock?: boolean
          inventory_quantity?: number
          name: string
          price: number
          sale_price?: number | null
          sizes?: string[] | null
          sku: string
          slug: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          estimated_restock_date?: string | null
          featured?: boolean
          id?: string
          images?: string[] | null
          in_stock?: boolean
          inventory_quantity?: number
          name?: string
          price?: number
          sale_price?: number | null
          sizes?: string[] | null
          sku?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            referencedRelation: "collections"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_alerts: {
        Row: {
          additional_info: string | null
          created_at: string | null
          email: string
          id: string
          notification_preference: string | null
          notified: boolean | null
          phone: string | null
          product_name: string
          product_sku: string | null
          quantity: number | null
          size: string
        }
        Insert: {
          additional_info?: string | null
          created_at?: string | null
          email: string
          id?: string
          notification_preference?: string | null
          notified?: boolean | null
          phone?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number | null
          size: string
        }
        Update: {
          additional_info?: string | null
          created_at?: string | null
          email?: string
          id?: string
          notification_preference?: string | null
          notified?: boolean | null
          phone?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number | null
          size?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string | null
          id: string
          notified: boolean
          product_id: string
          selected_size: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notified?: boolean
          product_id: string
          selected_size?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notified?: boolean
          product_id?: string
          selected_size?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_signups_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_signups_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
