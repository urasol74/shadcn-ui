import { createClient } from '@supabase/supabase-js'

// Используем новые значения напрямую
const supabaseUrl = 'http://178.212.198.23:8000'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJleHAiOjE3ODkyMTQzMjUsImlhdCI6MTc1NzY3ODMyNX0.qk3_lQzPJa0IaOYPnH932y-jl6LV5_e5BKqqxsBPsa8'

console.log('Инициализация клиента Supabase с URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey)

// Добавим обработчик ошибок
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state change:', event, session);
});

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