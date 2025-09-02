/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
	const supabase = (await createClient()) as any
	const moduleId = req.nextUrl.searchParams.get('module')
	let query = supabase.from('content_item').select('*').order('created_at', { ascending: false })
	if (moduleId) {
		query = query.eq('module_id', moduleId)
	}
	const { data, error } = await query
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
	const supabase = (await createClient()) as any
	const body = await req.json()
	const { module_id, slug, title, summary, default_locale } = body

	if (!module_id || !slug || !title) return NextResponse.json({ error: 'module_id, slug, title required' }, { status: 400 })

	const {
		data: { user },
		error: userErr,
	} = await supabase.auth.getUser()
	if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const { data, error } = await supabase
		.from('content_item')
		.insert({ module_id, slug, title, summary, default_locale, created_by: user.id })
		.select('*')
		.single()

	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data }, { status: 201 })
} 