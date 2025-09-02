import { createBrowserClient } from '@supabase/ssr'
import { createClient as createServerClientCore } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function getBrowserClient() {
	return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

export async function getClient() {
	const cookieStore = await cookies()
	return createServerClientCore<Database>(supabaseUrl, supabaseAnonKey, {
		auth: { persistSession: false },
		cookies: {
			getAll() { return cookieStore.getAll() },
			setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
		},
	})
}

export function getAdminClient() {
	if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
	return createServerClientCore<Database>(supabaseUrl, serviceKey, { auth: { persistSession: false } })
} 