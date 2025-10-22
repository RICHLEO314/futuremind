# Future Mind 教育平台所有表的完整结构

基于 SQL 迁移文件，这里是 Future Mind 教育平台所有表的完整结构：

## 📋 完整表清单 (18张表)

### 1. **audit_log** - 系统审计日志
```sql
id                uuid (主键, 自动生成)
entity_type       text (实体类型) ✓必填
entity_id         uuid (实体ID) ✓必填
action            text (操作动作) ✓必填
actor             uuid (操作者) → profiles.id
diff              jsonb (变更差异, 默认: {})
created_at        timestamptz (创建时间, 默认: now())
```

### 2. **content_item** - 内容项目
```sql
id                uuid (主键, 自动生成)
module_id         uuid (所属模块) → content_module.id
slug              text (URL路径) ✓必填
title             text (标题) ✓必填
summary           text (摘要)
default_locale    text (默认语言, 默认: zh-CN)
created_by        uuid (创建者) → profiles.id
created_at        timestamptz (创建时间, 默认: now())
updated_at        timestamptz (更新时间, 默认: now())
```

### 3. **content_locale** - 多语言内容
```sql
id                uuid (主键, 自动生成)
version_id        uuid (版本ID) → content_version.id
locale            text (语言代码) ✓必填
title             text (本地化标题) ✓必填
summary           text (本地化摘要)
content           jsonb (本地化内容, 默认: {})
```

### 4. **content_module** - 内容模块
```sql
id                uuid (主键, 自动生成)
key               text (模块唯一键) ✓必填 ✓唯一
title             text (模块标题) ✓必填
description       text (模块描述)
created_by        uuid (创建者) → profiles.id
created_at        timestamptz (创建时间, 默认: now())
updated_at        timestamptz (更新时间, 默认: now())
```

### 5. **content_relation** - 内容关系
```sql
id                uuid (主键, 自动生成)
source_item_id    uuid (源内容) → content_item.id
target_item_id    uuid (目标内容) → content_item.id
relation_type     text (关系类型) ✓必填
weight            real (权重, 默认: 1.0)
```

### 6. **content_version** - 内容版本
```sql
id                uuid (主键, 自动生成)
item_id           uuid (内容项ID) → content_item.id
version_number    integer (版本号) ✓必填
state             text (状态) ✓必填 [draft|review|published]
created_by        uuid (创建者) → profiles.id
created_at        timestamptz (创建时间, 默认: now())
```

### 7. **documents** - 文档嵌入向量
```sql
id                bigint (主键, 自动递增)
content           text (文档内容)
metadata          jsonb (元数据)
embedding         vector (向量嵌入)
```

### 8. **gaia_conversations** - 盖亚对话记录 🤖
```sql
id                uuid (主键, 自动生成)
user_id           uuid (用户ID) → profiles.id
messages          jsonb (消息数组, 默认: [])
created_at        timestamptz (创建时间, 默认: now())
updated_at        timestamptz (更新时间, 默认: now())
```

### 9. **lessons** - 课程内容
```sql
id                   uuid (主键, 随机生成)
season_id            uuid (季节ID) → seasons.id
week_number          integer (周数) ✓必填
day_number           integer (日数) ✓必填
title                text (标题) ✓必填
subtitle             text (副标题)
description          text (描述)
insight_content      text (洞察内容)
meditation_practice  jsonb (冥想练习)
life_practice        jsonb (生活实践)
ai_exploration_prompt text (AI探索提示)
video_resources      jsonb (视频资源, 默认: [])
audio_resources      jsonb (音频资源, 默认: [])
image_resources      jsonb (图片资源, 默认: [])
estimated_duration   integer (预计时长, 默认: 30分钟)
difficulty_level     integer (难度等级, 默认: 1)
tags                 text[] (标签数组, 默认: {})
created_at           timestamptz (创建时间, 默认: now())
updated_at           timestamptz (更新时间, 默认: now())
```

### 10. **media_asset** - 媒体资产
```sql
id                uuid (主键, 自动生成)
module_id         uuid (模块ID) → content_module.id
item_id           uuid (内容项ID) → content_item.id
url               text (资源URL) ✓必填
type              text (媒体类型)
meta              jsonb (元数据, 默认: {})
created_by        uuid (创建者) → profiles.id
created_at        timestamptz (创建时间, 默认: now())
```

### 11. **media_resources** - 媒体资源
```sql
id                uuid (主键, 随机生成)
lesson_id         uuid (课程ID) → lessons.id
type              text (类型) [video|audio|image|document]
title             text (标题) ✓必填
url               text (资源URL) ✓必填
source            text (来源)
duration          integer (时长)
metadata          jsonb (元数据, 默认: {})
```

### 12. **pbl_projects** - 项目式学习
```sql
id                   uuid (主键, 自动生成)
title                text (项目标题) ✓必填
description          text (项目描述)
season_id            uuid (季节ID) → seasons.id
max_participants     integer (最大参与者数, 默认: 10)
current_participants integer (当前参与者数, 默认: 0)
status               text (状态, 默认: active) [active|completed|paused]
created_at           timestamptz (创建时间, 默认: now())
```

### 13. **profiles** - 用户档案 👤⭐
```sql
id                   uuid (主键) → auth.users.id
email                text (邮箱) ✓必填 ✓唯一
full_name            text (全名)
avatar_url           text (头像URL)
consciousness_level  integer (意识等级, 默认: 1)
created_at           timestamptz (创建时间, 默认: now())
updated_at           timestamptz (更新时间, 默认: now())
consciousness_tree   jsonb (意识树数据)
role                 text (用户角色, 默认: user) [user|content_viewer|content_editor|content_admin]
```

**意识树默认结构：**
```json
{
  "roots": 0,
  "trunk": 0,
  "fruits": 0,
  "branches": 0,
  "last_updated": null,
  "visual_style": "default"
}
```

### 14. **project_participants** - 项目参与者
```sql
id                uuid (主键, 自动生成)
project_id        uuid (项目ID) → pbl_projects.id
user_id           uuid (用户ID) → profiles.id
role              text (角色, 默认: participant) [participant|leader|mentor]
joined_at         timestamptz (加入时间, 默认: now())
```

### 15. **publish_log** - 发布日志
```sql
id                uuid (主键, 自动生成)
item_id           uuid (内容项ID) → content_item.id
version_id        uuid (版本ID) → content_version.id
action            text (操作) ✓必填
actor             uuid (操作者) → profiles.id
notes             text (备注)
created_at        timestamptz (创建时间, 默认: now())
```

### 16. **seasons** - 教学季节
```sql
id                uuid (主键, 自动生成)
title             text (标题) ✓必填
description       text (描述)
start_date        date (开始日期) ✓必填
end_date          date (结束日期) ✓必填
is_active         boolean (是否活跃, 默认: false)
created_at        timestamptz (创建时间, 默认: now())
```

### 17. **trigger_log** - 触发器日志
```sql
id                integer (主键, 自动递增)
message           text (日志消息)
conversation_id   uuid (对话ID)
created_at        timestamptz (创建时间, 默认: now())
```

### 18. **user_progress** - 用户进度 📈
```sql
id                   uuid (主键, 自动生成)
user_id              uuid (用户ID) → profiles.id
season_id            uuid (季节ID) → seasons.id
current_day          integer (当前天数, 默认: 1)
completed_tasks      text[] (已完成任务, 默认: {})
consciousness_growth integer (意识成长值, 默认: 0)
created_at           timestamptz (创建时间, 默认: now())
updated_at           timestamptz (更新时间, 默认: now())
daily_records        jsonb (每日记录, 默认: [])
progress_type        text (进度类型) [reading|meditation|pbl|insight|artifact]
ref_item_id          uuid (关联内容项) → content_item.id
progress_value       integer (进度值, 默认: 0)
note                 text (备注)
```

## 🔗 关键关系链

**核心意识成长链：**
- `auth.users` → `profiles` (用户认证→个人档案)
- `profiles` → `gaia_conversations` (用户→AI对话)
- `gaia_conversations` → **自动意识分析** → `profiles.consciousness_tree` (更新)

**内容管理链：**
- `content_module` → `content_item` → `content_version` → `content_locale`
- `seasons` → `lessons` → `media_resources`

**学习进度链：**
- `profiles` → `user_progress` → `content_item`
- `profiles` → `project_participants` → `pbl_projects`

---

**系统总结：**

这个数据库架构支撑了一个完整的个性化教育平台，具备AI对话、意识成长分析、内容管理、进度跟踪等核心功能。