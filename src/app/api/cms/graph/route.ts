import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ItemNode = { id: string; title: string; slug: string; module_id: string }
type Relation = { source_item_id: string; target_item_id: string; relation_type: string; weight: number | null }

export async function GET(req: NextRequest) {
	const supabase = await createClient()
	const id = req.nextUrl.searchParams.get('item')
	if (!id) return NextResponse.json({ error: 'item required' }, { status: 400 })

	const { data: item } = await supabase
		.from('content_item')
		.select('id, title, slug, module_id')
		.eq('id', id)
		.single()
	const center = item as ItemNode | null
	if (!center) return NextResponse.json({ error: 'Not found' }, { status: 404 })

	const { data: relsRaw, error: rErr } = await supabase
		.from('content_relation')
		.select('source_item_id, target_item_id, relation_type, weight')
		.or(`source_item_id.eq.${id},target_item_id.eq.${id}`)
	if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })
	const rels = (relsRaw ?? []) as Relation[]

	const nodeIds = Array.from(new Set([center.id, ...rels.map(r => r.source_item_id), ...rels.map(r => r.target_item_id)]))
	const { data: nodesRaw } = await supabase
		.from('content_item')
		.select('id, title')
		.in('id', nodeIds)
	const nodes = (nodesRaw ?? []) as { id: string; title: string }[]

	return NextResponse.json({
		nodes: nodes.map(n => ({ id: n.id, label: n.title })),
		edges: rels.map(r => ({ from: r.source_item_id, to: r.target_item_id, label: r.relation_type, value: r.weight ?? 1 })),
		center: { id: center.id }
	})
} 