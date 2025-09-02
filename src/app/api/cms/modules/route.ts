import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ModuleSchema = z.object({
	key: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
})

function err(status: number, message: string) {
	return NextResponse.json({ error: { code: status, message } }, { status })
}

function getErrorMessage(e: unknown): string {
	if (e instanceof Error) return e.message
	try { return JSON.stringify(e) } catch { return String(e) }
}

export async function GET() {
	try {
		const supabase = await createClient()
		const { data, error } = await supabase.from('content_module').select('*').order('created_at', { ascending: false })
		if (error) return err(500, error.message)
		return NextResponse.json({ data })
	} catch (e: unknown) {
		return err(500, getErrorMessage(e))
	}
}

export async function POST(req: NextRequest) {
	const supabase = await createClient()
	try {
		const parsed = ModuleSchema.safeParse(await req.json())
		if (!parsed.success) return err(400, parsed.error.issues.map(i => i.message).join('; '))
		const { key, title, description } = parsed.data

		const {
			data: { user },
			error: userErr,
		} = await supabase.auth.getUser()
		if (userErr || !user) return err(401, 'Unauthorized')

		const { data, error } = await supabase
			.from('content_module')
			.insert({ key, title, description, created_by: user.id })
			.select('*')
			.single()

		if (error) return err(500, error.message)
		return NextResponse.json({ data }, { status: 201 })
	} catch (e: unknown) {
		try {
			await (await createClient()).rpc('write_audit', { p_entity_type: 'content_module', p_entity_id: null, p_action: 'modules_post_error', p_diff: { message: getErrorMessage(e) } })
		} catch {}
		return err(500, getErrorMessage(e))
	}
}
