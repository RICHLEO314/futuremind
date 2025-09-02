# CMS MVP 说明

## 架构（L.I.G.H.T.）
- Logic: Next.js Route Handlers（/api/cms/*），服务端校验、发布流、n8n webhook
- Interface: /admin/content 后台入口，模块/条目/发布面板（可扩展到富文本与图谱编辑）
- Graph: /api/cms/graph 返回语义关系图（vis-network/d3 可视化）
- Hybrid Storage: Supabase Postgres + Storage（媒体）+ pgvector（预留）
- Triggers: 发布后调用 n8n webhook -> 嵌入向量 -> 更新盖亚知识库

## 表结构
- content_module(id, key, title, description, created_by, created_at, updated_at)
- content_item(id, module_id, slug, title, summary, default_locale, created_by, created_at, updated_at)
- content_version(id, item_id, version_number, state[draft/review/published], created_by, created_at)
- content_locale(id, version_id, locale, title, summary, content JSONB)
- media_asset(id, module_id, item_id, url, type, meta, created_by, created_at)
- content_relation(id, source_item_id, target_item_id, relation_type, weight)
- publish_log(id, item_id, version_id, action, actor, notes, created_at)
- audit_log(id, entity_type, entity_id, action, actor, diff, created_at)
- user_progress 扩展(progress_type, ref_item_id, progress_value, note)
- 视图 v_published_content：每个条目的最新已发布版本及本地化

## RBAC + RLS
- profiles.role ∈ {user, content_viewer, content_editor, content_admin}
- viewer: SELECT
- editor: SELECT/INSERT/UPDATE（部分表）
- admin: 额外查看 publish/audit 日志与版本强制更新

## API
- GET/POST `/api/cms/modules`
- GET/POST `/api/cms/items`（可用 ?module= 过滤）
- POST `/api/cms/versions`（创建版本+本地化）
- POST `/api/cms/publish`（状态置为 published，写 publish_log，并触发 n8n）
- GET `/api/cms/graph?item=:id`（语义关系节点/边）
- POST `/api/progress`（记录阅读/冥想/PBL/洞见/作品进度）

## 后台
- `/admin/content`：模块管理、条目管理、发布与审计面板入口

## 种子脚本
- `node scripts/seed-cms.js` 导入四库最小内容

## 环境变量
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY（仅本地或 CI 种子脚本使用）
- N8N_WEBHOOK_URL（可选）

## 联动点
- 发布内容 -> n8n webhook（cms_publish） -> 生成向量嵌入（pgvector）-> 更新盖亚知识库
- 用户完成 冥想/PBL/阅读 节点 -> POST /api/progress -> 写 user_progress -> 驱动意识进化树 