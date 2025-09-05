# FutureMind 技术文档

## 环境配置

### 开发环境启动
```bash
# 1. 启动 Next.js 开发服务器
npm run dev  # http://localhost:3000

# 2. 启动上传服务器
node scripts/upload-server.js  # http://localhost:3002

# 3. 启动静态文件服务器
node scripts/static-server.js  # http://localhost:3001
```

### 环境变量配置
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://lvjezsnwesyblnlkkirz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n 集成
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/...
```

## 数据库结构

### 核心表
- `users`: 用户信息
- `pbl_projects`: PBL 项目
- `project_participants`: 项目参与者
- `media_asset`: 媒体资源
- `audit_log`: 审计日志

### 关键字段
```sql
-- media_asset 表
CREATE TABLE media_asset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  meta JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API 端点

### 文档上传
- **POST** `/api/uploads/document`
- 支持格式: PDF, DOC, DOCX, TXT
- 最大大小: 25MB
- 集成 n8n 处理

### 音频上传
- **POST** `/api/uploads/audio`
- 支持格式: MP3, WAV
- 最大大小: 50MB
- 直接存储到 Supabase Storage

### 视频外链
- **POST** `/api/media/link`
- 支持平台: B站, YouTube, 等
- 自动提取视频信息

## 文件处理

### 文件名安全化
```javascript
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*\s]/g, '_')  // 危险字符
    .replace(/[^\x00-\x7F]/g, '')     // 非 ASCII 字符
    .replace(/_+/g, '_')              // 合并下划线
    .replace(/^_|_$/g, '')            // 首尾下划线
    .substring(0, 100);               // 长度限制
}
```

### Storage 路径结构
```
media/
├── audio/
│   └── {project_id}/
│       └── {timestamp}_{filename}
├── documents/
│   └── {project_id}/
│       └── {timestamp}_{filename}
└── images/
    └── {project_id}/
        └── {timestamp}_{filename}
```

## 错误处理

### 常见错误码
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 权限不足
- `404`: 资源不存在
- `413`: 文件过大
- `415`: 不支持的文件类型
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "success": false,
  "error": "错误描述",
  "details": "详细错误信息",
  "code": "ERROR_CODE"
}
```

## 安全措施

### 文件上传安全
1. 文件类型验证
2. 文件大小限制
3. 文件名安全化
4. 病毒扫描（待实现）

### API 安全
1. CORS 配置
2. 请求频率限制
3. 输入验证
4. SQL 注入防护

## 性能优化

### 前端优化
- 图片懒加载
- 代码分割
- 缓存策略
- 压缩优化

### 后端优化
- 数据库索引
- 查询优化
- 连接池
- 缓存机制

## 监控和日志

### 审计日志
所有重要操作都会记录到 `audit_log` 表：
```javascript
await writeAuditLog(entityType, entityId, action, diff);
```

### 错误监控
- 服务器错误日志
- 客户端错误收集
- 性能监控
- 用户行为分析

## 部署配置

### Vercel 部署
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### 域名配置
- 主域名: futuremind.example.com
- API 域名: api.futuremind.example.com
- 静态资源: cdn.futuremind.example.com

## 备份策略

### 数据库备份
- 每日自动备份
- 增量备份
- 异地备份

### 文件备份
- Supabase Storage 自动备份
- 定期同步到其他云存储

## 故障排除

### 常见问题
1. **音频上传失败**: 检查文件名是否包含特殊字符
2. **数据库连接失败**: 检查环境变量配置
3. **文件访问 403**: 检查 Storage 权限设置
4. **n8n 集成失败**: 检查 webhook URL 配置

### 调试工具
- 浏览器开发者工具
- Supabase Dashboard
- 服务器日志
- 网络抓包工具

---
*技术文档版本: 1.0*
*最后更新: 2025-01-09*
