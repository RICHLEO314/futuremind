/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
	const supabase = (await createClient()) as any
	const body = await req.json()
	const { progress_type, ref_item_id, progress_value = 1, note } = body
	if (!progress_type) return NextResponse.json({ error: 'progress_type required' }, { status: 400 })

	const {
		data: { user },
		error: userErr,
	} = await supabase.auth.getUser()
	if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const { data: season } = await supabase
		.from('seasons')
		.select('id')
		.eq('is_active', true)
		.limit(1)
		.single()
	if (!season) return NextResponse.json({ error: 'No active season' }, { status: 400 })

	const { error } = await supabase.from('user_progress').upsert(
		{
			user_id: user.id,
			season_id: season.id,
			progress_type,
			ref_item_id: ref_item_id ?? null,
			progress_value,
			note: note ?? null,
		},
		{ onConflict: 'user_id,season_id' }
	)
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ ok: true })
} 