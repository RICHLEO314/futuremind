import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          consciousness_level: number
          created_at: string
          updated_at: string
          role?: 'user' | 'content_viewer' | 'content_editor' | 'content_admin'
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          consciousness_level?: number
          created_at?: string
          updated_at?: string
          role?: 'user' | 'content_viewer' | 'content_editor' | 'content_admin'
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          consciousness_level?: number
          created_at?: string
          updated_at?: string
          role?: 'user' | 'content_viewer' | 'content_editor' | 'content_admin'
        }
      }
      seasons: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          season_id: string
          current_day: number
          completed_tasks: string[]
          consciousness_growth: number
          created_at: string
          updated_at: string
          progress_type?: 'reading' | 'meditation' | 'pbl' | 'insight' | 'artifact' | null
          ref_item_id?: string | null
          progress_value?: number | null
          note?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          season_id: string
          current_day?: number
          completed_tasks?: string[]
          consciousness_growth?: number
          created_at?: string
          updated_at?: string
          progress_type?: 'reading' | 'meditation' | 'pbl' | 'insight' | 'artifact' | null
          ref_item_id?: string | null
          progress_value?: number | null
          note?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          season_id?: string
          current_day?: number
          completed_tasks?: string[]
          consciousness_growth?: number
          created_at?: string
          updated_at?: string
          progress_type?: 'reading' | 'meditation' | 'pbl' | 'insight' | 'artifact' | null
          ref_item_id?: string | null
          progress_value?: number | null
          note?: string | null
        }
      }
      gaia_conversations: {
        Row: {
          id: string
          user_id: string
          messages: Record<string, unknown>[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages?: Record<string, unknown>[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: Record<string, unknown>[]
          created_at?: string
          updated_at?: string
        }
      }
      pbl_projects: {
        Row: {
          id: string
          title: string
          description: string | null
          season_id: string
          max_participants: number
          current_participants: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          season_id: string
          max_participants?: number
          current_participants?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          season_id?: string
          max_participants?: number
          current_participants?: number
          status?: string
          created_at?: string
        }
      }
      project_participants: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      content_module: {
        Row: {
          id: string
          key: string
          title: string
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          title: string
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          title?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_item: {
        Row: {
          id: string
          module_id: string
          slug: string
          title: string
          summary: string | null
          default_locale: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          slug: string
          title: string
          summary?: string | null
          default_locale?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          slug?: string
          title?: string
          summary?: string | null
          default_locale?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_version: {
        Row: {
          id: string
          item_id: string
          version_number: number
          state: 'draft' | 'review' | 'published'
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          version_number: number
          state: 'draft' | 'review' | 'published'
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          version_number?: number
          state?: 'draft' | 'review' | 'published'
          created_by?: string | null
          created_at?: string
        }
      }
      content_locale: {
        Row: {
          id: string
          version_id: string
          locale: string
          title: string
          summary: string | null
          content: Record<string, unknown>
        }
        Insert: {
          id?: string
          version_id: string
          locale: string
          title: string
          summary?: string | null
          content?: Record<string, unknown>
        }
        Update: {
          id?: string
          version_id?: string
          locale?: string
          title?: string
          summary?: string | null
          content?: Record<string, unknown>
        }
      }
      media_asset: {
        Row: {
          id: string
          module_id: string | null
          item_id: string | null
          url: string
          type: string | null
          meta: Record<string, unknown> | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          module_id?: string | null
          item_id?: string | null
          url: string
          type?: string | null
          meta?: Record<string, unknown> | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string | null
          item_id?: string | null
          url?: string
          type?: string | null
          meta?: Record<string, unknown> | null
          created_by?: string | null
          created_at?: string
        }
      }
      content_relation: {
        Row: {
          id: string
          source_item_id: string
          target_item_id: string
          relation_type: string
          weight: number | null
        }
        Insert: {
          id?: string
          source_item_id: string
          target_item_id: string
          relation_type: string
          weight?: number | null
        }
        Update: {
          id?: string
          source_item_id?: string
          target_item_id?: string
          relation_type?: string
          weight?: number | null
        }
      }
      publish_log: {
        Row: {
          id: string
          item_id: string
          version_id: string
          action: string
          actor: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          version_id: string
          action: string
          actor?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          version_id?: string
          action?: string
          actor?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          action: string
          actor: string | null
          diff: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          action: string
          actor?: string | null
          diff?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          action?: string
          actor?: string | null
          diff?: Record<string, unknown> | null
          created_at?: string
        }
      }
    }
  }
}
