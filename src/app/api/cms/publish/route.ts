/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

export async function POST(req: NextRequest) {
	const supabase = (await createClient()) as any
	const body = await req.json()
	const { version_id, notes } = body
	if (!version_id) return NextResponse.json({ error: 'version_id required' }, { status: 400 })

	const {
		data: { user },
		error: userErr,
	} = await supabase.auth.getUser()
	if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const { data: version, error: vErr } = await supabase
		.from('content_version')
		.update({ state: 'published' })
		.eq('id', version_id)
		.select('id, item_id, version_number, created_at')
		.single()
	if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 })

	await supabase.from('publish_log').insert({ item_id: version.item_id, version_id: version.id, action: 'publish', actor: user.id, notes })

	if (N8N_WEBHOOK_URL) {
		try {
			await fetch(N8N_WEBHOOK_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ event: 'cms_publish', payload: { version_id: version.id } }),
			})
		} catch {}
	}

	return NextResponse.json({ data: version }, { status: 200 })
} 