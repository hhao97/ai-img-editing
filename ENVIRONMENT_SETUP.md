# 环境配置指南

## 概述

本项目需要配置多个环境变量才能正常运行。这些变量包括数据库连接、认证配置、API 密钥等。

## 环境变量分类

### 1. 数据库配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | MySQL/TiDB 连接字符串 | `mysql://root:password@localhost:3306/ai_ecommerce` |

**获取方式**：
- 本地开发：使用本地 MySQL 服务器
- 云环境：使用云数据库服务（如 AWS RDS、TiDB Cloud）

### 2. 认证配置

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `JWT_SECRET` | JWT 签名密钥 | 生成强随机字符串（≥32字符） |
| `VITE_APP_ID` | OAuth 应用 ID | Manus 平台应用设置 |
| `OAUTH_SERVER_URL` | OAuth 服务器 URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | OAuth 登录门户 | `https://manus.im/oauth` |

**JWT_SECRET 生成方法**：
```bash
# 使用 openssl
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Manus 平台配置

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `OWNER_OPEN_ID` | 项目所有者 ID | Manus 账户设置 |
| `OWNER_NAME` | 项目所有者名称 | 自定义 |
| `BUILT_IN_FORGE_API_URL` | Manus API 基础 URL | `https://api.manus.im/forge` |
| `BUILT_IN_FORGE_API_KEY` | 服务器端 API Key | Manus 平台生成 |
| `VITE_FRONTEND_FORGE_API_KEY` | 前端 API Key | Manus 平台生成 |

### 4. 应用配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | `电商AI商品图生成器` |
| `VITE_APP_LOGO` | 应用 Logo URL | 可选 |

### 5. 分析配置（可选）

| 变量名 | 说明 |
|--------|------|
| `VITE_ANALYTICS_ENDPOINT` | 分析服务端点 |
| `VITE_ANALYTICS_WEBSITE_ID` | 分析网站 ID |

### 6. 用户提供的配置

| 变量名 | 说明 | 输入方式 |
|--------|------|---------|
| OpenRouter API Key | 用户的 API 密钥 | 应用设置页面输入 |

**注意**：用户的 OpenRouter API Key 不需要在环境变量中配置，而是在应用的设置页面中输入，然后存储在浏览器的 localStorage 中。

## 启动步骤

### 1. 准备数据库

```bash
# 创建数据库（如果使用本地 MySQL）
mysql -u root -p
CREATE DATABASE ai_ecommerce_image_gen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 迁移数据库 schema
pnpm db:push
```

### 2. 配置环境变量

创建 `.env` 文件（在项目根目录），复制以下内容并填入实际值：

```bash
# 数据库
DATABASE_URL=mysql://root:password@localhost:3306/ai_ecommerce_image_gen

# 认证
JWT_SECRET=your-32-character-random-string-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# Manus 平台
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-server-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# 应用
VITE_APP_TITLE=电商AI商品图生成器
VITE_APP_LOGO=

# 分析（可选）
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# 开发环境
NODE_ENV=development
PORT=3000
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 `https://ai-img.zeabur.app/` 即可使用应用。

### 5. 在应用中配置 OpenRouter API Key

1. 访问应用主页
2. 点击"设置"按钮
3. 输入您的 OpenRouter API Key（格式：`sk-or-v1-xxxxx`）
4. 点击"保存"

## 生产环境部署

### 1. 构建项目

```bash
pnpm build
```

### 2. 启动生产服务器

```bash
NODE_ENV=production pnpm start
```

### 3. 环境变量配置

在生产环境中，建议使用以下方式配置环境变量：

- **Docker**：通过 `docker run -e` 或 `docker-compose.yml` 传入
- **Kubernetes**：通过 ConfigMap 和 Secret 管理
- **云平台**：使用平台的环境变量管理功能（如 Heroku、Railway、Render 等）
- **系统环境**：直接设置系统环境变量

## 常见问题

### Q: 如何获取 Manus OAuth 应用 ID？
A: 登录 Manus 平台，进入应用设置，复制应用 ID。

### Q: JWT_SECRET 应该多长？
A: 建议至少 32 个字符，使用强随机字符串。

### Q: 可以在生产环境中使用本地 SQLite 数据库吗？
A: 不建议。应该使用云数据库服务，如 AWS RDS、TiDB Cloud 等。

### Q: OpenRouter API Key 需要在 .env 中配置吗？
A: 不需要。用户在应用设置页面中输入 API Key，存储在浏览器本地。

### Q: 如何更改应用标题和 Logo？
A: 修改 `VITE_APP_TITLE` 和 `VITE_APP_LOGO` 环境变量。

### Q: 数据库连接失败怎么办？
A: 检查 `DATABASE_URL` 是否正确，确保数据库服务正在运行。

## 安全建议

1. **不要提交 .env 文件**：只提交 `.env.example`
2. **使用强密钥**：JWT_SECRET 应该是强随机字符串
3. **限制 API Key 权限**：在 OpenRouter 平台中限制 API Key 的使用权限
4. **定期轮换密钥**：定期更换 JWT_SECRET 和 API Key
5. **使用 HTTPS**：生产环境必须使用 HTTPS
6. **环境隔离**：开发、测试、生产环境使用不同的密钥和数据库

## 相关文档

- [Manus 平台文档](https://manus.im/docs)
- [OpenRouter API 文档](https://openrouter.ai/docs)
- [MySQL 文档](https://dev.mysql.com/doc)
- [tRPC 文档](https://trpc.io)

---

**最后更新**：2024年12月23日
