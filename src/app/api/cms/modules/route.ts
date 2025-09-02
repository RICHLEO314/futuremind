import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase'
import { z } from 'zod'
import type { Database } from '@/types/database'

const ModuleSchema = z.object({
	key: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
})

type ModuleInsert = Database['public']['Tables']['content_module']['Insert']

function err(status: number, message: string) {
	return NextResponse.json({ error: { code: status, message } }, { status })
}

function getErrorMessage(e: unknown): string {
	if (e instanceof Error) return e.message
	try { return JSON.stringify(e) } catch { return String(e) }
}

export async function GET() {
	try {
		const supabase = await getClient()
		const { data, error } = await supabase.from('content_module').select('*').order('created_at', { ascending: false })
		if (error) return err(500, error.message)
		return NextResponse.json({ data })
	} catch (e: unknown) {
		return err(500, getErrorMessage(e))
	}
}

export async function POST(req: NextRequest) {
	const supabase = await getClient()
	try {
		const parsed = ModuleSchema.safeParse(await req.json())
		if (!parsed.success) return err(400, parsed.error.issues.map(i => i.message).join('; '))
		const { key, title, description } = parsed.data

		const {
			data: { user },
			error: userErr,
		} = await supabase.auth.getUser()
		if (userErr || !user) return err(401, 'Unauthorized')

		const insertBody: ModuleInsert = { key, title, description, created_by: user.id }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data, error } = await (supabase as any)
			.from('content_module')
			.insert(insertBody)
			.select('*')
			.single()

		if (error) return err(500, error.message)
		return NextResponse.json({ data }, { status: 201 })
	} catch (e: unknown) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (await getClient()).rpc('write_audit', { p_entity: 'content_module', p_entity_id: null, p_action: 'modules_post_error', p_diff: { message: getErrorMessage(e) } } as any)
		} catch {}
		return err(500, getErrorMessage(e))
	}
}
