import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const VersionSchema = z.object({
	item_id: z.string().uuid(),
	state: z.enum(['draft','review','published']).default('draft').optional(),
	locale: z.string().default('zh-CN').optional(),
	title: z.string().min(1),
	summary: z.string().optional(),
	content: z.any().optional(),
})

type VersionRow = { id: string; version_number: number }

type ProfileRole = { role: 'user' | 'content_viewer' | 'content_editor' | 'content_admin' }

function err(status: number, message: string) {
	return NextResponse.json({ error: { code: status, message } }, { status })
}

function getErrorMessage(e: unknown): string {
	if (e instanceof Error) return e.message
	try { return JSON.stringify(e) } catch { return String(e) }
}

export async function POST(req: NextRequest) {
	const supabase = await createClient()
	try {
		const parsed = VersionSchema.safeParse(await req.json())
		if (!parsed.success) return err(400, parsed.error.issues.map(i => i.message).join('; '))
		const { item_id, state = 'draft', locale = 'zh-CN', title, summary, content } = parsed.data

		const {
			data: { user },
			error: userErr,
		} = await supabase.auth.getUser()
		if (userErr || !user) return err(401, 'Unauthorized')

		if (state === 'published') {
			const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
			const role = (prof as ProfileRole | null)?.role
			if (role !== 'content_admin') return err(403, 'Only admin can create published')
		}

		const { data: lastVersion } = await supabase
			.from('content_version')
			.select('version_number')
			.eq('item_id', item_id)
			.order('version_number', { ascending: false })
			.limit(1)
			.single()

		const nextVersion = (lastVersion?.version_number ?? 0) + 1

		const { data: version, error: vErr } = await supabase
			.from('content_version')
			.insert({ item_id, version_number: nextVersion, state, created_by: user.id })
			.select('id, version_number')
			.single()
		if (vErr) return err(500, vErr.message)

		const { data: localeRow, error: lErr } = await supabase
			.from('content_locale')
			.insert({ version_id: (version as VersionRow).id, locale, title, summary, content })
			.select('*')
			.single()
		if (lErr) return err(500, lErr.message)

		return NextResponse.json({ data: { version: version as VersionRow, locale: localeRow } }, { status: 201 })
	} catch (e: unknown) {
		try { await (await createClient()).rpc('write_audit', { p_entity_type: 'content_version', p_entity_id: null, p_action: 'versions_post_error', p_diff: { message: getErrorMessage(e) } }) } catch {}
		return err(500, getErrorMessage(e))
	}
} 