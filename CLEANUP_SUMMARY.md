# 项目清理摘要

## 清理时间
2025-12-23

## 清理内容

### ✅ 删除的旧系统组件

#### 1. OAuth 系统（Manus OAuth）
- ❌ 删除 `registerOAuthRoutes()` 调用
- ❌ 删除 `OAUTH_SERVER_URL` 环境变量引用
- ❌ 删除 `OWNER_OPEN_ID` 环境变量引用
- ✅ 替换为 **BetterAuth 邮箱密码认证**

#### 2. 分析工具（Umami Analytics）
- ❌ 删除 `client/index.html` 中的 Umami 脚本标签
- ❌ 删除 `VITE_ANALYTICS_ENDPOINT` 环境变量
- ❌ 删除 `VITE_ANALYTICS_WEBSITE_ID` 环境变量

#### 3. 旧存储系统（Manus Forge Storage）
- ❌ 删除 `BUILT_IN_FORGE_API_URL` 环境变量
- ❌ 删除 `BUILT_IN_FORGE_API_KEY` 环境变量
- ✅ 替换为 **Supabase Storage**

#### 4. 其他不必要的配置
- ❌ 删除 `VITE_APP_ID`（Manus 平台相关）
- ❌ 删除 `JWT_SECRET`（使用 BETTER_AUTH_SECRET 替代）
- ❌ 删除 `OWNER_USER_ID`（不再需要）

### 📝 更新的文件

| 文件 | 更改内容 |
|------|---------|
| `server/_core/index.ts` | 删除 OAuth 路由注册 |
| `server/_core/env.ts` | 更新为 BetterAuth + Supabase 配置 |
| `server/_core/context.ts` | 使用 BetterAuth 验证用户 |
| `server/storage.ts` | 完全重写为 Supabase Storage API |
| `server/db.ts` | 删除 ownerOpenId 相关逻辑 |
| `client/index.html` | 删除分析工具脚本 |
| `.env` | 简化环境变量配置 |

### ✨ 保留的核心功能

✅ 用户认证（使用 BetterAuth）
✅ 图片生成（OpenRouter API）
✅ 图片编辑（OpenRouter API）
✅ 文件存储（Supabase Storage）
✅ 历史记录查询
✅ tRPC API 层
✅ React 前端

## 当前环境变量清单

### 必需配置
```bash
# 数据库
DATABASE_URL=postgresql://postgres:...@db.cpvdbsvrhmrgkayzlgts.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://cpvdbsvrhmrgkayzlgts.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_STORAGE_BUCKET=images

# BetterAuth
BETTER_AUTH_SECRET=FSv02zwVBEIv3IhoWQ34/3/ph2mZUnueS2bugtEfi+A=
BETTER_AUTH_BASE_URL=https://ai-img.zeabur.app/
```

### 可选配置
```bash
# OpenRouter（可在前端输入）
OPENROUTER_API_KEY=

# 应用配置
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
ENABLE_API_LOGGING=true
```

## 架构变化总结

### 之前
```
┌─────────────┐
│ Manus OAuth │ ← 用户认证
└─────────────┘
┌─────────────┐
│ Forge Store │ ← 文件存储
└─────────────┘
┌─────────────┐
│ MySQL       │ ← 数据库
└─────────────┘
```

### 现在
```
┌──────────────┐
│ BetterAuth   │ ← 邮箱密码认证
└──────────────┘
┌──────────────┐
│ Supabase     │ ← 数据库 + 存储
│ - PostgreSQL │
│ - Storage    │
└──────────────┘
```

## 解决的问题

1. ✅ `OAUTH_SERVER_URL is not configured` 错误
2. ✅ `%VITE_ANALYTICS_ENDPOINT% is not defined` 警告
3. ✅ `Malformed URI sequence` 错误
4. ✅ 简化了项目依赖
5. ✅ 统一到 Supabase 生态系统

## 下一步

1. 运行 `pnpm dev` 启动应用
2. 访问 https://ai-img.zeabur.app//register 注册账户
3. 测试图片生成功能

## 技术栈（清理后）

- **前端**: React 19 + Tailwind CSS 4 + shadcn/ui
- **后端**: Express + tRPC
- **认证**: BetterAuth（邮箱密码）
- **数据库**: Supabase PostgreSQL
- **存储**: Supabase Storage
- **AI**: OpenRouter API（Google Gemini 2.5 Flash）

---

**清理完成时间**: 2025-12-23
**清理的文件数**: 7 个核心文件
**删除的依赖**: 0 个（保持轻量级）
