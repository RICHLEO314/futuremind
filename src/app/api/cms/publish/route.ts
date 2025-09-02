/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const PublishSchema = z.object({ version_id: z.string().uuid(), notes: z.string().optional() })
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

function err(status: number, message: string) {
	return NextResponse.json({ error: { code: status, message } }, { status })
}

async function postWithRetry(url: string, payload: unknown) {
	let attempt = 0
	let lastError: any
	while (attempt < 3) {
		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
			const text = await res.text()
			if (res.ok) return { ok: true, status: res.status, body: text }
			lastError = new Error(`HTTP ${res.status}: ${text}`)
		} catch (e: any) {
			lastError = e
		}
		await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500))
		attempt++
	}
	return { ok: false, error: lastError?.message ?? 'Unknown error' }
}

export async function POST(req: NextRequest) {
	const supabase = (await createClient()) as any
	try {
		const parsed = PublishSchema.safeParse(await req.json())
		if (!parsed.success) return err(400, parsed.error.issues.map(i => i.message).join('; '))
		const { version_id, notes } = parsed.data

		const {
			data: { user },
			error: userErr,
		} = await supabase.auth.getUser()
		if (userErr || !user) return err(401, 'Unauthorized')

		// idempotency: ensure we only set to published once
		const { data: current } = await supabase.from('content_version').select('id, state, item_id, version_number').eq('id', version_id).single()
		if (!current) return err(404, 'Version not found')
		if (current.state === 'published') {
			return NextResponse.json({ data: current, message: 'Already published' }, { status: 200 })
		}

		const { data: version, error: vErr } = await supabase
			.from('content_version')
			.update({ state: 'published' })
			.eq('id', version_id)
			.select('id, item_id, version_number, created_at')
			.single()
		if (vErr) return err(500, vErr.message)

		let webhookNote = notes ?? ''
		if (N8N_WEBHOOK_URL) {
			const result = await postWithRetry(N8N_WEBHOOK_URL, { event: 'cms_publish', payload: { version_id: version.id } })
			if (result.ok) webhookNote += `\nwebhook: ok(${(result as any).status})`
			else webhookNote += `\nwebhook: fail(${(result as any).error})`
		}

		await supabase.from('publish_log').insert({ item_id: version.item_id, version_id: version.id, action: 'publish', actor: user.id, notes: webhookNote })

		return NextResponse.json({ data: version }, { status: 200 })
	} catch (e: any) {
		try { await supabase.rpc('write_audit', { p_entity_type: 'content_version', p_entity_id: null, p_action: 'publish_post_error', p_diff: { message: e?.message ?? 'Internal Error' } }) } catch {}
		return err(500, e?.message ?? 'Internal Error')
	}
} 