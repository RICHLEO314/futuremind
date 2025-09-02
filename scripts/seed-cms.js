/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRole) {
	console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
	process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function upsertModule(key, title, description) {
	const { data, error } = await supabase
		.from('content_module')
		.upsert({ key, title, description }, { onConflict: 'key' })
		.select('id')
		.single()
	if (error) throw error
	return data.id
}

async function upsertItem(module_id, slug, title, summary) {
	const { data, error } = await supabase
		.from('content_item')
		.upsert({ module_id, slug, title, summary }, { onConflict: 'module_id,slug' })
		.select('id')
		.single()
	if (error) throw error
	return data.id
}

async function createVersion(item_id, state, locale, title, summary, content) {
	// get last version
	const { data: last } = await supabase
		.from('content_version')
		.select('version_number')
		.eq('item_id', item_id)
		.order('version_number', { ascending: false })
		.limit(1)
		.single()
	const nextVersion = (last?.version_number ?? 0) + 1
	const { data: version, error: vErr } = await supabase
		.from('content_version')
		.insert({ item_id, version_number: nextVersion, state })
		.select('id')
		.single()
	if (vErr) throw vErr
	const { error: lErr } = await supabase
		.from('content_locale')
		.insert({ version_id: version.id, locale, title, summary, content })
	if (lErr) throw lErr
}

async function main() {
	// ① 极简物理
	const m1 = await upsertModule('minimal-physics', '极简物理（罗韦利选摘）', '选摘摘要与导读')
	const i11 = await upsertItem(m1, 'book-1', '第一册摘要', '关键概念摘要')
	await createVersion(i11, 'published', 'zh-CN', '第一册摘要', '引导阅读', { blocks: [{ type: 'paragraph', text: '这是第一册的概念提要。' }] })

	// ② 14天冥想
	const m2 = await upsertModule('meditation-14-days', '14天冥想', '每日引导与音频占位')
	for (let day = 1; day <= 14; day++) {
		const slug = `day-${day}`
		const title = `Day ${day}`
		const id = await upsertItem(m2, slug, title, '冥想引导与音频')
		await createVersion(id, 'published', 'zh-CN', title, '引导语', { audio: null, text: `第${day}天冥想引导。` })
	}

	// ③ PBL 伊卡洛斯计划（示例三模块×年龄段）
	const m3 = await upsertModule('pbl-icarus', 'PBL：伊卡洛斯计划', '项目卡与里程碑')
	const modules = ['探索', '实验', '总结']
	const ages = ['child', 'teen', 'adult']
	for (const mod of modules) {
		for (const age of ages) {
			const slug = `${mod}-${age}`
			const title = `${mod}（${age}）`
			const id = await upsertItem(m3, slug, title, '阶段说明与目标')
			await createVersion(id, 'published', 'zh-CN', title, '阶段目标', { milestones: [] })
		}
	}

	// ④ 意识进化树（基础节点）
	const m4 = await upsertModule('consciousness-tree', '意识进化树', '根/干/枝/果基础节点与映射规则')
	const nodes = [
		{ slug: 'root-knowledge', title: '根：新知识节点', summary: '阅读/学习触发' },
		{ slug: 'trunk-meditation', title: '干：冥想规律', summary: '规律与持续' },
		{ slug: 'branch-milestone', title: '枝：里程碑/洞见', summary: '阶段性突破' },
		{ slug: 'fruit-artifact', title: '果：作品/被共鸣', summary: '产出与共鸣' },
	]
	for (const n of nodes) {
		const id = await upsertItem(m4, n.slug, n.title, n.summary)
		await createVersion(id, 'published', 'zh-CN', n.title, n.summary, { kind: n.slug })
	}

	console.log('Seed completed')
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
}) 