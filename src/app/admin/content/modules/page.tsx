import { createClient } from '@/lib/supabase/server'

export default async function ModulesPage() {
	const supabase = await createClient()
	const { data } = await supabase.from('content_module').select('id, title, key').order('created_at', { ascending: false })
	const modules = (data ?? []) as { id: string; title: string; key: string }[]

	return (
		<div className="p-6 space-y-4">
			<h2 className="text-xl font-semibold">模块管理</h2>
			<div className="space-y-2">
				{modules.map((m) => (
					<div key={m.id} className="border rounded p-3">
						<div className="font-medium">{m.title}</div>
						<div className="text-sm text-gray-500">{m.key}</div>
					</div>
				))}
			</div>
		</div>
	)
} 