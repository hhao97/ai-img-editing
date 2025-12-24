# Supabase + BetterAuth 配置指南

## 已完成的集成

✅ 数据库从 MySQL 迁移到 Supabase PostgreSQL
✅ 集成 BetterAuth 邮箱密码认证（无需邮箱验证）
✅ 创建登录和注册页面
✅ 更新 tRPC 认证中间件

## 环境变量配置

你的 `.env` 文件已经创建，但还需要完成以下步骤：

### 1. 获取 Supabase API Keys

访问 [Supabase Dashboard](https://supabase.com/dashboard)：

1. 选择你的项目 `cpvdbsvrhmrgkayzlgts`
2. 点击左侧菜单 **Settings** → **API**
3. 在 **Project API keys** 部分找到：
   - **anon/public key**：复制到 `SUPABASE_ANON_KEY`
   - **service_role key**（点击眼睛图标显示）：复制到 `SUPABASE_SERVICE_ROLE_KEY`

### 2. 创建 Supabase Storage Bucket

1. 在 Supabase Dashboard 点击左侧 **Storage**
2. 点击 **New bucket**
3. 名称填写：`images`
4. 设置为 **Public bucket**（允许公开访问）
5. 点击 **Create bucket**

### 3. OpenRouter API Key（可选）

访问 [OpenRouter](https://openrouter.ai)：

1. 注册并登录
2. 前往 **API Keys** 页面
3. 创建新的 API Key
4. 复制 Key 到 `OPENROUTER_API_KEY`（或在前端输入）

## 更新后的 .env 文件

```bash
# ===================================
# 应用基础配置
# ===================================
NODE_ENV=development
PORT=3000

# ===================================
# Supabase 数据库配置
# ===================================
DATABASE_URL=postgresql://postgres:I2anbC7HAAZ4qiOX@db.cpvdbsvrhmrgkayzlgts.supabase.co:5432/postgres

# Supabase 项目 URL
SUPABASE_URL=https://cpvdbsvrhmrgkayzlgts.supabase.co

# 【需要填写】在 Supabase Dashboard > Settings > API 中获取
SUPABASE_ANON_KEY=请填写你的 Supabase Anon Key

# 【需要填写】在 Supabase Dashboard > Settings > API 中获取
SUPABASE_SERVICE_ROLE_KEY=请填写你的 Supabase Service Role Key

# ===================================
# Better Auth 认证配置
# ===================================
# JWT 签名密钥（已自动生成）
BETTER_AUTH_SECRET=FSv02zwVBEIv3IhoWQ34/3/ph2mZUnueS2bugtEfi+A=

# 应用基础 URL
BETTER_AUTH_BASE_URL=https://ai-img.zeabur.app/

# 允许的认证方式（仅使用邮箱密码）
BETTER_AUTH_PROVIDERS=email

# ===================================
# 文件存储配置
# ===================================
STORAGE_PROVIDER=supabase
SUPABASE_STORAGE_BUCKET=images

# ===================================
# OpenRouter API 配置（可选）
# ===================================
OPENROUTER_API_KEY=

# ===================================
# 其他配置
# ===================================
LOG_LEVEL=info
ENABLE_API_LOGGING=true
```

## 启动应用

完成环境变量配置后：

```bash
# 1. 安装依赖（如果还没有）
pnpm install

# 2. 确认数据库迁移已执行（已完成）
# npx drizzle-kit push

# 3. 启动开发服务器
pnpm dev

# 4. 访问应用
# https://ai-img.zeabur.app/
```

## 测试认证流程

1. 访问 https://ai-img.zeabur.app//register
2. 填写邮箱、密码进行注册
3. 注册成功后自动登录并跳转到首页
4. 访问 https://ai-img.zeabur.app//login 测试登录

## API 端点

BetterAuth 提供以下认证端点：

- `POST /api/auth/sign-up/email` - 邮箱注册
- `POST /api/auth/sign-in/email` - 邮箱登录
- `POST /api/auth/sign-out` - 登出
- `GET /api/auth/session` - 获取当前会话

## 常见问题

### Q: 数据库连接失败？

检查 `DATABASE_URL` 是否正确，确保密码没有特殊字符转义问题。

### Q: 注册时提示邮箱已存在？

Supabase 会自动检查邮箱唯一性。如果邮箱已注册，请使用不同的邮箱或直接登录。

### Q: 登录后访问需要认证的页面仍然被拒绝？

检查浏览器 Cookie 是否启用，BetterAuth 使用 Cookie 存储会话。

### Q: 如何修改密码最小长度？

编辑 `server/auth.ts` 文件中的 `minPasswordLength` 配置：

```typescript
emailAndPassword: {
  minPasswordLength: 8, // 修改为 8
}
```

## 数据库结构

已创建的表：

- **users** - 用户表（包含 email、passwordHash、name 等字段）
- **sessions** - 会话表（存储用户登录会话）
- **accounts** - 账户表（OAuth 提供商账户）
- **imageGenerations** - 图片生成记录
- **imageEdits** - 图片编辑记录

## 下一步

1. 填写 `.env` 文件中的 Supabase API Keys
2. 创建 Supabase Storage Bucket
3. 运行 `pnpm dev` 启动应用
4. 测试注册和登录功能

## 技术栈

- **认证**：BetterAuth 1.4.8
- **数据库**：Supabase PostgreSQL
- **ORM**：Drizzle ORM 0.44.6
- **前端**：React 19.2.1
- **后端**：Express 4.21.2 + tRPC 11.6.0

---

**配置时间**：2025-12-23
**文档版本**：1.0.0
