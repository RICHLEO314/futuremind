import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
	const supabase = (await createClient()) as any
	const { data, error } = await supabase.from('content_module').select('*').order('created_at', { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
	const supabase = (await createClient()) as any
	const body = await req.json()
	const { key, title, description } = body

	if (!key || !title) return NextResponse.json({ error: 'key and title are required' }, { status: 400 })

	const {
		data: { user },
		error: userErr,
	} = await supabase.auth.getUser()
	if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const { data, error } = await supabase
		.from('content_module')
		.insert({ key, title, description, created_by: user.id })
		.select('*')
		.single()

	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data }, { status: 201 })
}
