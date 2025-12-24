# AI 电商商品图生成器 - AI 上下文文档

> **最后更新**: 2025-12-23 21:50:24
> **项目版本**: 1.0.0
> **文档类型**: 根级架构文档

---

## 变更记录 (Changelog)

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-12-23 | 初始化 | 首次生成 AI 上下文文档，覆盖全栈架构与模块索引 |

---

## 项目愿景

**AI 电商商品图生成器** 是一个全栈 Web 应用，旨在为电商用户提供 AI 驱动的商品图片生成与编辑能力。通过集成 OpenRouter API（Google Gemini 2.5 Flash 模型），用户可以：

- 输入文字描述，快速生成专业级商品图
- 上传现有图片，通过 AI 进行智能编辑
- 管理历史生成/编辑记录，随时下载使用

**核心价值**：降低电商商品摄影成本，提升视觉内容生产效率。

**目标用户**：电商店主、商品运营、内容创作者、摄影师。

---

## 架构总览

### 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | React | 19.2.1 | 现代化 UI 框架 |
| **样式** | Tailwind CSS | 4.1.14 | 实用优先的样式框架 |
| **组件库** | shadcn/ui | - | 基于 Radix UI 的高质量组件 |
| **路由** | Wouter | 3.3.5 | 轻量级 React 路由 |
| **后端框架** | Express | 4.21.2 | Node.js Web 服务器 |
| **API 框架** | tRPC | 11.6.0 | 端到端类型安全 RPC |
| **数据库 ORM** | Drizzle ORM | 0.44.5 | 类型安全的 SQL ORM |
| **数据库** | MySQL/TiDB | - | 关系型数据库 |
| **文件存储** | AWS S3 / Manus Forge | - | 云存储服务 |
| **认证** | Manus OAuth | - | OAuth 2.0 认证 |
| **构建工具** | Vite | 7.1.7 | 极速构建与 HMR |
| **测试** | Vitest | 2.1.4 | 快速单元测试 |
| **包管理** | pnpm | 10.4.1+ | 高效的包管理器 |

### 架构模式

- **前后端分离**：React SPA + Express API Server
- **类型安全全链路**：TypeScript + tRPC 实现端到端类型推导
- **单体仓库**：前端、后端、共享代码统一管理
- **SSR-free**：纯客户端渲染，适合 H5 移动端

---

## 模块结构图

```mermaid
graph TD
    A["(根) ai-ecommerce-image-gen"] --> B["client/"];
    A --> C["server/"];
    A --> D["drizzle/"];
    A --> E["shared/"];

    B --> B1["src/"];
    B1 --> B1a["pages/"];
    B1 --> B1b["components/"];
    B1 --> B1c["hooks/"];
    B1 --> B1d["lib/"];

    C --> C1["_core/"];
    C1 --> C1a["index.ts (入口)"];
    C1 --> C1b["trpc.ts"];
    C1 --> C1c["oauth.ts"];
    C1 --> C1d["imageGeneration.ts"];
    C --> C2["routers.ts"];
    C --> C3["db.ts"];
    C --> C4["openrouter.ts"];
    C --> C5["storage.ts"];

    D --> D1["schema.ts"];
    D --> D2["migrations/"];

    E --> E1["const.ts"];
    E --> E2["types.ts"];

    click B "./client/CLAUDE.md" "查看前端模块文档"
    click C "./server/CLAUDE.md" "查看后端模块文档"
    click D "./drizzle/CLAUDE.md" "查看数据库模块文档"
    click E "./shared/CLAUDE.md" "查看共享模块文档"
```

---

## 模块索引

| 模块路径 | 职责 | 入口文件 | 说明 |
|----------|------|----------|------|
| **client/** | 前端应用 | `client/src/main.tsx` | React SPA，包含页面、组件、hooks、路由 |
| **server/** | 后端服务 | `server/_core/index.ts` | Express + tRPC API 服务器，处理业务逻辑 |
| **drizzle/** | 数据库层 | `drizzle/schema.ts` | 数据库 Schema 定义、迁移文件、关系模型 |
| **shared/** | 共享代码 | `shared/const.ts`, `shared/types.ts` | 前后端共享的常量、类型定义、工具函数 |
| **server/_core/** | 框架核心 | `server/_core/index.ts` | Manus 框架核心模块（OAuth、环境变量、tRPC配置等） |

---

## 运行与开发

### 环境变量

项目依赖以下环境变量（需创建 `.env` 文件）：

```bash
# 数据库
DATABASE_URL=mysql://user:pass@host:port/db_name

# JWT 密钥
JWT_SECRET=your_jwt_secret_key

# Manus OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://oauth.manus.computer
OWNER_OPEN_ID=your_owner_open_id

# Manus Forge Storage
BUILT_IN_FORGE_API_URL=https://forge-api-url
BUILT_IN_FORGE_API_KEY=your_forge_api_key

# 运行环境
NODE_ENV=development
PORT=3000
```

### 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式（启动前端 + 后端热重载）
pnpm dev

# 类型检查
pnpm check

# 运行测试（27 个单元测试）
pnpm test

# 数据库迁移（生成 + 执行）
pnpm db:push

# 代码格式化
pnpm format

# 生产构建
pnpm build

# 生产启动
pnpm start
```

### 开发流程

1. **本地开发**：`pnpm dev` 启动开发服务器（默认 http://localhost:3000）
2. **数据库初始化**：`pnpm db:push` 同步 Schema 到数据库
3. **修改代码**：前端支持 HMR，后端使用 `tsx watch` 自动重启
4. **测试**：`pnpm test` 运行单元测试
5. **部署**：`pnpm build && pnpm start` 生产部署

---

## 测试策略

### 测试覆盖

- **单元测试**：27 个测试用例，覆盖核心业务逻辑
- **测试框架**：Vitest（快速、类型安全）
- **测试文件**：
  - `server/openrouter.test.ts`（13 个测试）：OpenRouter API 集成测试
  - `server/images.test.ts`（13 个测试）：图片生成/编辑业务逻辑
  - `server/auth.logout.test.ts`（1 个测试）：认证流程测试

### 测试范围

- OpenRouter API 调用（生成、编辑、验证）
- 数据库操作（创建、查询、更新）
- tRPC 路由（输入验证、错误处理）
- OAuth 登出流程

### 未覆盖

- 前端组件单元测试
- E2E 集成测试
- 性能/压力测试

---

## 编码规范

### 通用规范

- **语言**：TypeScript（严格模式，`strict: true`）
- **代码风格**：使用 Prettier 格式化（配置文件：`.prettierrc`）
- **命名约定**：
  - 文件名：camelCase（如 `imageGeneration.ts`）或 PascalCase（如 `Home.tsx`）
  - 变量/函数：camelCase
  - 类型/接口：PascalCase
  - 常量：UPPER_SNAKE_CASE

### 前端规范

- **组件结构**：
  - 页面组件放在 `client/src/pages/`
  - 复用组件放在 `client/src/components/`
  - UI 组件放在 `client/src/components/ui/`（基于 shadcn/ui）
- **状态管理**：
  - 使用 React Hooks（useState、useEffect 等）
  - tRPC 自带 React Query，用于服务端状态
- **样式**：
  - Tailwind CSS 优先，避免内联样式
  - 遵循斯堪的纳维亚美学（简洁、大量留白、柔和配色）

### 后端规范

- **tRPC 路由**：
  - 所有 API 定义在 `server/routers.ts`
  - 使用 Zod 进行输入验证
  - 受保护的路由使用 `protectedProcedure`
- **数据库操作**：
  - 所有查询封装在 `server/db.ts` 中
  - 使用 Drizzle ORM，避免裸 SQL
- **错误处理**：
  - 使用 tRPC 内置错误类型（`TRPCError`）
  - 记录详细日志到控制台

---

## AI 使用指引

### 功能流程

#### 1. 图片生成流程

```
用户输入 prompt → 前端收集 API Key → 调用 tRPC images.generate
→ 后端调用 OpenRouter API → AI 返回 base64 图片
→ 上传到 S3 → 返回图片 URL → 保存到数据库
```

**关键文件**：
- `client/src/pages/Generate.tsx`（前端页面）
- `server/routers.ts`（tRPC 路由定义）
- `server/openrouter.ts`（OpenRouter API 集成）
- `server/storage.ts`（S3 上传）
- `server/db.ts`（数据库保存）

#### 2. 图片编辑流程

```
用户上传原始图片 → 上传到 S3 → 获取 URL
→ 用户输入编辑指令 → 调用 tRPC images.edit
→ 后端调用 OpenRouter API（携带原始图片 URL + 编辑 prompt）
→ AI 返回编辑后的图片 → 上传到 S3 → 保存到数据库
```

**关键文件**：
- `client/src/pages/Edit.tsx`
- `server/routers.ts`（`images.edit` 路由）
- `server/openrouter.ts`（`editImageWithPrompt` 函数）

#### 3. API Key 管理

- **存储位置**：浏览器 `localStorage`（不上传服务器）
- **使用方式**：每次 API 调用时从前端传递到后端
- **安全性**：仅在 HTTPS 下传输，后端不持久化

### OpenRouter API 文档

- **模型**：`google/gemini-2.5-flash-image-preview`
- **能力**：
  - 文字生成图片（Text-to-Image）
  - 图片理解与编辑（Image-to-Image）
- **接口**：`https://openrouter.ai/api/v1/chat/completions`
- **文档**：https://openrouter.ai/docs

---

## 核心数据模型

### 数据库表

#### users（用户表）
- **主键**：`id`（自增）
- **唯一标识**：`openId`（OAuth 用户 ID）
- **字段**：name、email、loginMethod、role、createdAt、updatedAt、lastSignedIn

#### imageGenerations（图片生成记录）
- **主键**：`id`
- **外键**：`userId` → `users.id`
- **字段**：prompt（提示词）、imageUrl（S3 URL）、imageKey（S3 Key）、status（状态）、errorMessage、createdAt、updatedAt

#### imageEdits（图片编辑记录）
- **主键**：`id`
- **外键**：`userId` → `users.id`
- **字段**：originalImageUrl、originalImageKey、editPrompt、editedImageUrl、editedImageKey、status、errorMessage、createdAt、updatedAt

---

## 关键依赖

### 前端核心依赖

- `react@19.2.1` + `react-dom@19.2.1`
- `@trpc/react-query@11.6.0`（tRPC React 集成）
- `@tanstack/react-query@5.90.2`（数据获取与缓存）
- `wouter@3.3.5`（路由）
- `tailwindcss@4.1.14` + `@tailwindcss/vite@4.1.3`
- `lucide-react@0.453.0`（图标库）
- `sonner@2.0.7`（Toast 通知）
- `framer-motion@12.23.22`（动画）

### 后端核心依赖

- `express@4.21.2`
- `@trpc/server@11.6.0`
- `drizzle-orm@0.44.5` + `mysql2@3.15.0`
- `jose@6.1.0`（JWT 处理）
- `zod@4.1.12`（Schema 验证）
- `cookie@1.0.2`（Cookie 处理）
- `dotenv@17.2.2`（环境变量）

---

## 常见问题 (FAQ)

### Q1: 如何修改 AI 模型？

修改 `server/openrouter.ts` 中的 `GEMINI_MODEL` 常量，替换为其他 OpenRouter 支持的模型。

### Q2: 如何更换存储服务（从 S3 到其他云存储）？

修改 `server/storage.ts` 中的 `storagePut` 和 `storageGet` 函数，替换为目标存储服务的 SDK 调用。

### Q3: 如何添加新的页面？

1. 在 `client/src/pages/` 创建新组件
2. 在 `client/src/App.tsx` 的 `Router` 中添加路由
3. 可选：在导航菜单中添加链接

### Q4: 如何添加新的 tRPC 路由？

1. 在 `server/routers.ts` 中定义新路由
2. 在 `server/db.ts` 中添加数据库操作函数（如需要）
3. 前端通过 `trpc.xxx.useQuery()` 或 `trpc.xxx.useMutation()` 调用

### Q5: 数据库迁移失败怎么办？

```bash
# 1. 检查 DATABASE_URL 是否正确
echo $DATABASE_URL

# 2. 手动生成迁移文件
npx drizzle-kit generate

# 3. 手动执行迁移
npx drizzle-kit migrate

# 4. 验证数据库连接
mysql -h <host> -u <user> -p <database>
```

---

## 文件统计

### 全局统计

- **TypeScript 文件**：38 个（~3385 行代码）
- **React 组件（TSX）**：70 个（~9936 行代码）
- **JSON 配置**：6 个（~607 行）
- **SQL 迁移**：3 个（~134 行）
- **总计有效代码文件**：117 个

### 模块文件分布

| 模块 | 文件数 | 主要文件类型 |
|------|--------|--------------|
| `client/src/` | 72+ | `.tsx`, `.ts` |
| `server/` | 23+ | `.ts`, `.test.ts` |
| `drizzle/` | 7+ | `.ts`, `.sql`, `.json` |
| `shared/` | 3 | `.ts` |
| 根配置 | 10+ | `.json`, `.ts`, `.md` |

---

## 相关文档

- [README.md](./README.md) - 用户使用指南
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目技术总结
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南（如有）
- [client/CLAUDE.md](./client/CLAUDE.md) - 前端模块文档
- [server/CLAUDE.md](./server/CLAUDE.md) - 后端模块文档
- [drizzle/CLAUDE.md](./drizzle/CLAUDE.md) - 数据库模块文档

---

## 联系方式

- **项目维护者**：通过 `OWNER_OPEN_ID` 环境变量指定
- **Manus 平台支持**：https://manus.computer
- **OpenRouter 支持**：https://openrouter.ai/docs

---

**最后更新时间**：2025-12-23 21:50:24
**文档生成工具**：Claude Code AI（自适应架构师模式）
