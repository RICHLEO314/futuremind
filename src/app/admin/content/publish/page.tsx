import { createClient } from '@/lib/supabase/server'

export default async function PublishPage() {
	const supabase = await createClient()
	const { data } = await supabase
		.from('publish_log')
		.select('id, action, created_at, content_item(title), content_version(version_number)')
		.order('created_at', { ascending: false })
		.limit(20)
	const logs = (data ?? []) as { id: string; action: string; created_at: string; content_item?: { title?: string }; content_version?: { version_number?: number } }[]

	return (
		<div className="p-6 space-y-4">
			<h2 className="text-xl font-semibold">发布与审计</h2>
			<div className="space-y-2">
				{logs.map((p) => (
					<div key={p.id} className="border rounded p-3">
						<div className="font-medium">{p.content_item?.title} v{p.content_version?.version_number}</div>
						<div className="text-sm text-gray-500">{p.action} · {new Date(p.created_at).toLocaleString()}</div>
					</div>
				))}
			</div>
		</div>
	)
} 