import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      products: {
        Row: {
          id: number
          article: string | null
          name: string | null
          category_id: number | null
          brand: string | null
          season: string | null
          gender: string | null
        }
        Insert: {
          id?: number
          article?: string | null
          name?: string | null
          category_id?: number | null
          brand?: string | null
          season?: string | null
          gender?: string | null
        }
        Update: {
          id?: number
          article?: string | null
          name?: string | null
          category_id?: number | null
          brand?: string | null
          season?: string | null
          gender?: string | null
        }
      }
      variants: {
        Row: {
          id: number
          product_id: number | null
          size: string | null
          color: string | null
          barcode: string | null
          stock: number | null
          purchase_price: number | null
          sale_price: number | null
          new_price: number | null
          total_price: number | null
          discount: number | null
        }
        Insert: {
          id?: number
          product_id?: number | null
          size?: string | null
          color?: string | null
          barcode?: string | null
          stock?: number | null
          purchase_price?: number | null
          sale_price?: number | null
          new_price?: number | null
          total_price?: number | null
          discount?: number | null
        }
        Update: {
          id?: number
          product_id?: number | null
          size?: string | null
          color?: string | null
          barcode?: string | null
          stock?: number | null
          purchase_price?: number | null
          sale_price?: number | null
          new_price?: number | null
          total_price?: number | null
          discount?: number | null
        }
      }
    }
  }
}