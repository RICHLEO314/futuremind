import Link from 'next/link'

export default function AdminContentPage() {
	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">内容管理（CMS）</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<Link href="/admin/content/modules" className="border rounded p-4 hover:bg-gray-50">
					<div className="font-semibold">模块管理</div>
					<div className="text-sm text-gray-500">创建/编辑模块</div>
				</Link>
				<Link href="/admin/content/items" className="border rounded p-4 hover:bg-gray-50">
					<div className="font-semibold">条目管理</div>
					<div className="text-sm text-gray-500">创建/编辑条目</div>
				</Link>
				<Link href="/admin/content/publish" className="border rounded p-4 hover:bg-gray-50">
					<div className="font-semibold">发布与审计</div>
					<div className="text-sm text-gray-500">发布内容、查看日志</div>
				</Link>
			</div>
		</div>
	)
} 