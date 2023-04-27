export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          passage_id: string | null
        }
        Insert: {
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          passage_id?: string | null
        }
        Update: {
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          passage_id?: string | null
        }
      }
      todos: {
        Row: {
          created_at: string
          id: number
          is_complete: boolean
          task: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_complete?: boolean
          task: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_complete?: boolean
          task?: string
          user_id?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
