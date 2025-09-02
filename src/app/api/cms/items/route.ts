/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ItemSchema = z.object({
	module_id: z.string().uuid(),
	slug: z.string().min(1),
	title: z.string().min(1),
	summary: z.string().optional(),
	default_locale: z.string().default('zh-CN').optional(),
})

function err(status: number, message: string) {
	return NextResponse.json({ error: { code: status, message } }, { status })
}

export async function GET(req: NextRequest) {
	try {
		const supabase = (await createClient()) as any
		const moduleId = req.nextUrl.searchParams.get('module')
		let query = supabase.from('content_item').select('*').order('created_at', { ascending: false })
		if (moduleId) {
			query = query.eq('module_id', moduleId)
		}
		const { data, error } = await query
		if (error) return err(500, error.message)
		return NextResponse.json({ data })
	} catch (e: any) {
		return err(500, e?.message ?? 'Internal Error')
	}
}

export async function POST(req: NextRequest) {
	const supabase = (await createClient()) as any
	try {
		const parsed = ItemSchema.safeParse(await req.json())
		if (!parsed.success) return err(400, parsed.error.issues.map(i => i.message).join('; '))
		const { module_id, slug, title, summary, default_locale } = parsed.data

		const {
			data: { user },
			error: userErr,
		} = await supabase.auth.getUser()
		if (userErr || !user) return err(401, 'Unauthorized')

		const { data, error } = await supabase
			.from('content_item')
			.insert({ module_id, slug, title, summary, default_locale, created_by: user.id })
			.select('*')
			.single()
		if (error) return err(500, error.message)
		return NextResponse.json({ data }, { status: 201 })
	} catch (e: any) {
		try {
			await supabase.rpc('write_audit', { p_entity_type: 'content_item', p_entity_id: null, p_action: 'items_post_error', p_diff: { message: e?.message ?? 'Internal Error' } })
		} catch {}
		return err(500, e?.message ?? 'Internal Error')
	}
} 