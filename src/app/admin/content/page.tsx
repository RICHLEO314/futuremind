import Link from 'next/link'

export default function AdminContentPage() {
	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">内容管理（CMS）</h1>
			<p className="text-sm text-gray-500">支持 i18n（zh-CN/en）、媒体上传与关系图编辑</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<Link href="/admin/content/modules" className="border rounded p-4 hover:bg-gray-50">
					<div className="font-semibold">模块管理</div>
					<div className="text-sm text-gray-500">创建/编辑模块</div>
				</Link>
				<Link href="/admin/content/items" className="border rounded p-4 hover:bg-gray-50">
					<div className="font-semibold">条目管理（i18n 双列）</div>
					<div className="text-sm text-gray-500">创建/编辑条目与本地化</div>
				</Link>
				<Link href="/admin/content/publish" className="border rounded p-4 hover:bg-gray-50">
					<div className="font-semibold">发布与审计</div>
					<div className="text-sm text-gray-500">发布内容、查看日志</div>
				</Link>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Link href="/admin/content/media" className="border rounded p-4 hover:bg-gray-50">
					<div className="font-semibold">媒资上传</div>
					<div className="text-sm text-gray-500">大小/类型限制，签名 URL</div>
				</Link>
				<Link href="/admin/content/graph" className="border rounded p-4 hover:bg-gray-50">
					<div className="font-semibold">关系图编辑</div>
					<div className="text-sm text-gray-500">新增/删除关系，保存到 content_relation</div>
				</Link>
			</div>
		</div>
	)
} 