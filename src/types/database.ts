export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
	public: {
		Tables: {
			profiles: {
				Row: { id: string; email: string; full_name: string | null; avatar_url: string | null; consciousness_level: number; role: 'user' | 'content_viewer' | 'content_editor' | 'content_admin' | null; created_at: string; updated_at: string }
				Insert: { id: string; email: string; full_name?: string | null; avatar_url?: string | null; consciousness_level?: number; role?: 'user' | 'content_viewer' | 'content_editor' | 'content_admin' | null; created_at?: string; updated_at?: string }
				Update: Partial<Database['public']['Tables']['profiles']['Row']>
			}
			seasons: {
				Row: { id: string; title: string; description: string; start_date: string; end_date: string; is_active: boolean; created_at: string }
				Insert: { id?: string; title: string; description: string; start_date: string; end_date: string; is_active?: boolean; created_at?: string }
				Update: Partial<Database['public']['Tables']['seasons']['Row']>
			}
			user_progress: {
				Row: { id: string; user_id: string; season_id: string; current_day: number; completed_tasks: string[]; consciousness_growth: number; created_at: string; updated_at: string; progress_type: 'reading' | 'meditation' | 'pbl' | 'insight' | 'artifact' | null; ref_item_id: string | null; progress_value: number | null; note: string | null }
				Insert: { id?: string; user_id: string; season_id: string; current_day?: number; completed_tasks?: string[]; consciousness_growth?: number; created_at?: string; updated_at?: string; progress_type?: 'reading' | 'meditation' | 'pbl' | 'insight' | 'artifact' | null; ref_item_id?: string | null; progress_value?: number | null; note?: string | null }
				Update: Partial<Database['public']['Tables']['user_progress']['Row']>
			}
			content_module: {
				Row: { id: string; key: string; title: string; description: string | null; created_by: string | null; created_at: string; updated_at: string }
				Insert: { id?: string; key: string; title: string; description?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
				Update: Partial<Database['public']['Tables']['content_module']['Row']>
			}
			content_item: {
				Row: { id: string; module_id: string; slug: string; title: string; summary: string | null; default_locale: string | null; created_by: string | null; created_at: string; updated_at: string }
				Insert: { id?: string; module_id: string; slug: string; title: string; summary?: string | null; default_locale?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
				Update: Partial<Database['public']['Tables']['content_item']['Row']>
			}
			content_version: {
				Row: { id: string; item_id: string; version_number: number; state: 'draft' | 'review' | 'published'; created_by: string | null; created_at: string }
				Insert: { id?: string; item_id: string; version_number: number; state: 'draft' | 'review' | 'published'; created_by?: string | null; created_at?: string }
				Update: Partial<Database['public']['Tables']['content_version']['Row']>
			}
			content_locale: {
				Row: { id: string; version_id: string; locale: string; title: string; summary: string | null; content: Json }
				Insert: { id?: string; version_id: string; locale: string; title: string; summary?: string | null; content?: Json }
				Update: Partial<Database['public']['Tables']['content_locale']['Row']>
			}
			media_asset: {
				Row: { id: string; module_id: string | null; item_id: string | null; url: string; type: string | null; meta: Json | null; created_by: string | null; created_at: string }
				Insert: { id?: string; module_id?: string | null; item_id?: string | null; url: string; type?: string | null; meta?: Json | null; created_by?: string | null; created_at?: string }
				Update: Partial<Database['public']['Tables']['media_asset']['Row']>
			}
			content_relation: {
				Row: { id: string; source_item_id: string; target_item_id: string; relation_type: string; weight: number | null }
				Insert: { id?: string; source_item_id: string; target_item_id: string; relation_type: string; weight?: number | null }
				Update: Partial<Database['public']['Tables']['content_relation']['Row']>
			}
			publish_log: {
				Row: { id: string; item_id: string; version_id: string; action: string; actor: string | null; notes: string | null; created_at: string }
				Insert: { id?: string; item_id: string; version_id: string; action: string; actor?: string | null; notes?: string | null; created_at?: string }
				Update: Partial<Database['public']['Tables']['publish_log']['Row']>
			}
			audit_log: {
				Row: { id: string; entity: string; entity_id: string; action: string; actor: string | null; diff: Json | null; created_at: string }
				Insert: { id?: string; entity: string; entity_id: string; action: string; actor?: string | null; diff?: Json | null; created_at?: string }
				Update: Partial<Database['public']['Tables']['audit_log']['Row']>
			}
		}
		Views: {
			v_published_content: {
				Row: { module_id: string; module_key: string; module_title: string; item_id: string; item_slug: string; locale: string; item_title: string; item_summary: string | null; item_content: Json | null; version_number: number; published_at: string }
			}
		}
	}
} 