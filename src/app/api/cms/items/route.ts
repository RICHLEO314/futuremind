import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase'
import { z } from 'zod'
import type { Database } from '@/types/database'

const ItemSchema = z.object({
	module_id: z.string().uuid(),
	slug: z.string().min(1),
	title: z.string().min(1),
	summary: z.string().optional(),
	default_locale: z.string().default('zh-CN').optional(),
})

type ItemRow = Database['public']['Tables']['content_item']['Row']

type ItemInsert = Database['public']['Tables']['content_item']['Insert']

function err(status: number, message: string) {
	return NextResponse.json({ error: { code: status, message } }, { status })
}

function getErrorMessage(e: unknown): string {
	if (e instanceof Error) return e.message
	try { return JSON.stringify(e) } catch { return String(e) }
}

export async function GET(req: NextRequest) {
	try {
		const supabase = await getClient()
		const moduleId = req.nextUrl.searchParams.get('module')
		let query = supabase.from('content_item').select('*').order('created_at', { ascending: false })
		if (moduleId) {
			query = query.eq('module_id', moduleId)
		}
		const { data, error } = await query
		if (error) return err(500, error.message)
		return NextResponse.json({ data: (data ?? []) as ItemRow[] })
	} catch (e: unknown) {
		return err(500, getErrorMessage(e))
	}
}

export async function POST(req: NextRequest) {
	const supabase = await getClient()
	try {
		const parsed = ItemSchema.safeParse(await req.json())
		if (!parsed.success) return err(400, parsed.error.issues.map(i => i.message).join('; '))
		const { module_id, slug, title, summary, default_locale } = parsed.data

		const {
			data: { user },
			error: userErr,
		} = await supabase.auth.getUser()
		if (userErr || !user) return err(401, 'Unauthorized')

		const insertBody: ItemInsert = { module_id, slug, title, summary, default_locale, created_by: user.id }
		const { data, error } = await supabase
			.from('content_item')
			.insert(insertBody)
			.select('*')
			.single()
		if (error) return err(500, error.message)
		return NextResponse.json({ data: data as ItemRow }, { status: 201 })
	} catch (e: unknown) {
		try {
			await (await getClient()).rpc('write_audit', { p_entity: 'content_item', p_entity_id: null, p_action: 'items_post_error', p_diff: { message: getErrorMessage(e) } })
		} catch {}
		return err(500, getErrorMessage(e))
	}
} 