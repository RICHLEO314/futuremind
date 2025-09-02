/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
	const supabase = (await createClient()) as any
	const body = await req.json()
	const { item_id, state = 'draft', locale = 'zh-CN', title, summary, content } = body
	if (!item_id || !title) return NextResponse.json({ error: 'item_id and title required' }, { status: 400 })

	const {
		data: { user },
		error: userErr,
	} = await supabase.auth.getUser()
	if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
	if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 })

	const { data: localeRow, error: lErr } = await supabase
		.from('content_locale')
		.insert({ version_id: version.id, locale, title, summary, content })
		.select('*')
		.single()
	if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 })

	return NextResponse.json({ data: { version, locale: localeRow } }, { status: 201 })
} 