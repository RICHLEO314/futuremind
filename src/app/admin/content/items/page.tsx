import { getClient } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ItemsPage(props: any) {
	const supabase = await getClient()
	const raw = props?.searchParams?.module as string | string[] | undefined
	const moduleId = Array.isArray(raw) ? raw[0] : raw
	let query = supabase.from('content_item').select('id, title, slug').order('created_at', { ascending: false })
	if (moduleId) query = query.eq('module_id', moduleId)
	const { data } = await query
	const items = (data ?? []) as { id: string; title: string; slug: string }[]

	return (
		<div className="p-6 space-y-4">
			<h2 className="text-xl font-semibold">条目管理</h2>
			<div className="space-y-2">
				{items.map((i) => (
					<div key={i.id} className="border rounded p-3">
						<div className="font-medium">{i.title}</div>
						<div className="text-sm text-gray-500">{i.slug}</div>
					</div>
				))}
			</div>
		</div>
	)
} 