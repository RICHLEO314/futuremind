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
- viewer: 仅可读 v_published_content
- editor: 可写 content_item/locale（创建草稿），可写 content_version 的 draft/review 状态
- admin: 可发布并查看 audit/publish 日志

## API
- GET/POST `/api/cms/modules`
- GET/POST `/api/cms/items`（?module= 过滤）
- POST `/api/cms/versions`（创建版本+本地化）
- POST `/api/cms/publish`（幂等+重试 webhook，记录 notes）
- GET `/api/cms/graph?item=:id`
- POST `/api/progress`

## 后台
- `/admin/content`：模块、条目、发布与审计，i18n 与媒资/图谱入口

## 种子脚本
- `node scripts/seed-cms.js` 导入四库最小内容（14 天冥想、PBL 示例、极简物理若干章、意识树四象限），并发布部分条目

## CI 配置与 Secrets
- 工作流：`.github/workflows/ci.yml`
  - 步骤：typecheck → build → vitest → playwright
  - 依赖：Node 20
  - 环境变量：从 GitHub Secrets 注入
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`（仅构建/种子/测试用，前端不可用）
    - `N8N_WEBHOOK_URL`（可选）
- 配置方法（GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret）
  - 将上述四项以 name/value 形式添加

## 安全
- 严禁在客户端或日志中泄露 `SUPABASE_SERVICE_ROLE_KEY`
- 仅在服务端与脚本中使用 service role 