import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function createAdminClient() {
	return createClient<Database>(supabaseUrl, serviceKey, { auth: { persistSession: false } })
} 