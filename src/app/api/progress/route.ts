import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase'
import { z } from 'zod'
import type { Database } from '@/types/database'

const ProgressSchema = z.object({
	progress_type: z.enum(['reading','meditation','pbl','insight','artifact']),
	ref_item_id: z.string().uuid().nullable().optional(),
	progress_value: z.number().int().min(0).max(100).default(1).optional(),
	note: z.string().optional(),
})

function err(status: number, message: string) {
	return NextResponse.json({ error: { code: status, message } }, { status })
}

function getErrorMessage(e: unknown): string {
	if (e instanceof Error) return e.message
	try { return JSON.stringify(e) } catch { return String(e) }
}

export async function POST(req: NextRequest) {
	const supabase = await getClient()
	try {
		const parsed = ProgressSchema.safeParse(await req.json())
		if (!parsed.success) return err(400, parsed.error.issues.map(i => i.message).join('; '))
		const { progress_type, ref_item_id, progress_value = 1, note } = parsed.data

		const { data: userData, error: userErr } = await supabase.auth.getUser()
		if (userErr || !userData.user) return err(401, 'Unauthorized')

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: season } = await (supabase as any)
			.from('seasons')
			.select('id')
			.eq('is_active', true)
			.limit(1)
			.single()
		if (!season) return err(400, 'No active season')

		const upsertBody: Database['public']['Tables']['user_progress']['Insert'] = {
			user_id: userData.user.id,
			season_id: season.id,
			progress_type,
			ref_item_id: ref_item_id ?? null,
			progress_value,
			note: note ?? null,
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabase as any).from('user_progress').upsert(upsertBody, { onConflict: 'user_id,season_id' })
		if (error) return err(500, error.message)
		return NextResponse.json({ ok: true })
	} catch (e: unknown) {
		try { 
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (await getClient()).rpc('write_audit', { p_entity: 'user_progress', p_entity_id: null, p_action: 'progress_post_error', p_diff: { message: getErrorMessage(e) } } as any) 
		} catch {}
		return err(500, getErrorMessage(e))
	}
} 