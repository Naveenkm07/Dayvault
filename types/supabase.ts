export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          theme: string
          accent_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          theme?: string
          accent_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          theme?: string
          accent_color?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          title: string
          description: string | null
          mood: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          title: string
          description?: string | null
          mood?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          title?: string
          description?: string | null
          mood?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          user_id: string
          entry_id: string
          storage_path: string
          public_or_signed_url_reference: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_id: string
          storage_path: string
          public_or_signed_url_reference: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_id?: string
          storage_path?: string
          public_or_signed_url_reference?: string
          caption?: string | null
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          user_id: string
          plan_date: string
          title: string
          description: string | null
          priority: string
          category: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_date: string
          title: string
          description?: string | null
          priority?: string
          category?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_date?: string
          title?: string
          description?: string | null
          priority?: string
          category?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      entry_tags: {
        Row: {
          entry_id: string
          tag_id: string
        }
        Insert: {
          entry_id: string
          tag_id: string
        }
        Update: {
          entry_id?: string
          tag_id?: string
        }
      }
    }
    Views: {
      [key: string]: never
    }
    Functions: {
      [key: string]: never
    }
    Enums: {
      [key: string]: never
    }
    CompositeTypes: {
      [key: string]: never
    }
  }
}
