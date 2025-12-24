# 电商AI商品图生成器 - 项目总结

## 📋 项目概述

**项目名称**：电商AI商品图生成器（ai-ecommerce-image-gen）

**项目描述**：一个基于 Next.js 和 React 的全栈 Web 应用，集成 OpenRouter API（Google Gemini 2.5 Flash 模型），为电商用户提供 AI 驱动的商品图片生成和编辑功能。用户可以通过输入文字描述生成高质量的商品图，或上传原图进行 AI 改写编辑。

**目标用户**：电商领域的用户，包括店铺运营者、商品摄影师、内容创作者等

## 🎯 核心功能

### 1. 图片生成功能
- 用户输入商品描述（prompt）
- 调用 OpenRouter API 的 Google Gemini 2.5 Flash 模型生成商品图
- 支持详细的商品描述，生成高质量的电商级别图片
- 生成的图片自动上传到 S3 存储
- 生成记录保存到数据库，支持历史查询

### 2. 图片编辑功能
- 用户上传原始图片
- 输入编辑要求（如"添加背景"、"调整颜色"等）
- 调用 OpenRouter API 对图片进行 AI 改写
- 编辑后的图片自动上传到 S3
- 编辑记录保存到数据库

### 3. API Key 管理
- 用户在设置页面输入 OpenRouter API Key
- API Key 存储在浏览器本地存储（localStorage）
- 每次请求时从本地存储读取 API Key 并发送到后端
- 后端使用 API Key 调用 OpenRouter API

### 4. 历史记录管理
- 用户可以查看所有生成的图片历史
- 用户可以查看所有编辑的图片历史
- 支持下载历史中的图片
- 历史记录保存在数据库中，与用户关联

### 5. 用户认证
- 集成 Manus OAuth 认证系统
- 用户登录后才能使用应用
- 用户信息与生成/编辑历史关联

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | React 19 | 现代化的 UI 框架 |
| **样式框架** | Tailwind CSS 4 | 实用优先的 CSS 框架 |
| **前端路由** | Wouter | 轻量级路由库 |
| **后端框架** | Express 4 | Node.js Web 框架 |
| **API 框架** | tRPC 11 | 类型安全的 RPC 框架 |
| **数据库 ORM** | Drizzle ORM | 类型安全的 SQL ORM |
| **数据库** | MySQL/TiDB | 关系型数据库 |
| **文件存储** | AWS S3 | 云存储服务 |
| **认证** | Manus OAuth | OAuth 认证系统 |
| **测试框架** | Vitest | 快速的单元测试框架 |
| **包管理** | pnpm | 高效的包管理器 |

## 📁 项目结构

```
ai-ecommerce-image-gen/
├── client/                          # 前端代码
│   ├── src/
│   │   ├── pages/                  # 页面组件
│   │   │   ├── Home.tsx            # 主页
│   │   │   ├── Generate.tsx        # 图片生成页面
│   │   │   ├── Edit.tsx            # 图片编辑页面
│   │   │   ├── History.tsx         # 历史记录页面
│   │   │   └── Settings.tsx        # 设置页面
│   │   ├── components/             # 可复用组件
│   │   ├── contexts/               # React Context
│   │   ├── hooks/                  # 自定义 Hook
│   │   ├── lib/                    # 工具库
│   │   ├── App.tsx                 # 应用主组件
│   │   ├── main.tsx                # 应用入口
│   │   └── index.css               # 全局样式
│   ├── index.html                  # HTML 模板
│   └── public/                     # 静态资源
│
├── server/                          # 后端代码
│   ├── _core/                      # 框架核心
│   │   ├── index.ts                # 服务器入口
│   │   ├── context.ts              # tRPC 上下文
│   │   ├── trpc.ts                 # tRPC 配置
│   │   ├── oauth.ts                # OAuth 认证
│   │   ├── llm.ts                  # LLM 集成
│   │   └── ...                     # 其他核心模块
│   ├── db.ts                       # 数据库查询函数
│   ├── routers.ts                  # tRPC 路由定义
│   ├── openrouter.ts               # OpenRouter API 集成
│   ├── storage.ts                  # S3 文件存储
│   ├── openrouter.test.ts          # OpenRouter 测试
│   ├── images.test.ts              # 图片功能测试
│   └── auth.logout.test.ts         # 认证测试
│
├── drizzle/                         # 数据库 Schema
│   ├── schema.ts                   # 表定义
│   ├── migrations/                 # 迁移文件
│   └── meta/                       # 迁移元数据
│
├── shared/                          # 共享代码
│   ├── const.ts                    # 常量定义
│   ├── types.ts                    # 类型定义
│   └── _core/                      # 共享工具
│
├── package.json                    # 项目依赖
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite 构建配置
├── vitest.config.ts                # Vitest 测试配置
├── drizzle.config.ts               # Drizzle 配置
├── README.md                       # 项目文档
├── PROJECT_SUMMARY.md              # 项目总结（本文件）
└── .env.example                    # 环境变量示例
```

## 🗄️ 数据库 Schema

### users 表
存储用户信息，与 Manus OAuth 关联。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| openId | VARCHAR(64) | OAuth 用户 ID，唯一 |
| name | TEXT | 用户名 |
| email | VARCHAR(320) | 邮箱 |
| loginMethod | VARCHAR(64) | 登录方式 |
| role | ENUM | 用户角色（user/admin） |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |
| lastSignedIn | TIMESTAMP | 最后登录时间 |

### imageGenerations 表
存储图片生成记录。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| userId | INT | 用户 ID，外键 |
| prompt | TEXT | 生成的 prompt |
| imageUrl | TEXT | 生成的图片 URL（S3） |
| status | VARCHAR(20) | 生成状态（success/failed） |
| errorMessage | TEXT | 错误信息 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

### imageEdits 表
存储图片编辑记录。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| userId | INT | 用户 ID，外键 |
| originalImageUrl | TEXT | 原始图片 URL |
| editPrompt | TEXT | 编辑要求 |
| editedImageUrl | TEXT | 编辑后的图片 URL（S3） |
| status | VARCHAR(20) | 编辑状态（success/failed） |
| errorMessage | TEXT | 错误信息 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

## 🎨 UI/UX 设计

### 设计风格
采用**斯堪的纳维亚美学**风格，强调简洁、现代和功能性。

### 色彩方案
- **背景色**：浅冷灰（#F5F7FA）
- **主色**：柔和粉蓝（#B8D4E8）
- **强调色**：腮红粉（#E8B8D4）
- **文字色**：深灰/黑色

### 字体
- **标题**：Playfair Display（粗体，优雅）
- **正文**：Inter（现代无衬线）

### 响应式设计
- 移动端优先的设计策略
- 完全适配 H5 和手机屏幕
- 触摸友好的交互设计

## 🔌 API 集成

### OpenRouter API
- **基础 URL**：`https://openrouter.ai/api/v1`
- **模型**：`google/gemini-2.5-flash-image-preview`
- **功能**：
  - 文本生成图片
  - 图片编辑和改写
  - API Key 验证

### S3 文件存储
- **用途**：存储生成和编辑的图片
- **路径结构**：
  - 生成图片：`images/generated/{timestamp}-{random}.png`
  - 编辑图片：`images/edited/{timestamp}-{random}.png`

## 📊 tRPC 路由

### 认证路由
- `auth.me` - 获取当前用户信息
- `auth.logout` - 用户登出

### 图片生成路由
- `images.generate` - 生成商品图（需要 API Key）
- `images.getHistory` - 获取生成历史

### 图片编辑路由
- `images.edit` - 编辑图片（需要 API Key）
- `images.getEditHistory` - 获取编辑历史

### 系统路由
- `system.notifyOwner` - 通知项目所有者

## 🧪 测试覆盖

- **单元测试**：27 个测试用例
- **测试框架**：Vitest
- **覆盖范围**：
  - OpenRouter API 集成（13 个测试）
  - 数据库操作（13 个测试）
  - 认证流程（1 个测试）

## 🚀 部署和启动

### 本地开发
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 类型检查
pnpm check

# 代码格式化
pnpm format
```

### 生产构建
```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

## 📝 必需的环境变量

详见 `.env.example` 文件。主要包括：
- 数据库连接字符串
- JWT 密钥
- OAuth 应用配置
- S3 存储配置
- Manus 平台相关配置

## 🔐 安全特性

1. **API Key 管理**：用户 API Key 存储在本地，不上传到服务器
2. **认证保护**：所有受保护的路由需要用户登录
3. **数据库加密**：敏感数据在数据库中安全存储
4. **CORS 配置**：适当的跨域资源共享配置
5. **环境变量隔离**：敏感信息通过环境变量管理

## 📈 性能优化

1. **S3 存储**：图片存储在云端，减少服务器负担
2. **数据库查询优化**：使用 Drizzle ORM 的类型安全查询
3. **前端缓存**：利用浏览器缓存和 localStorage
4. **异步处理**：图片生成和编辑采用异步处理

## 🎓 开发指南

### 添加新功能的步骤

1. **更新数据库 Schema**（如需要）
   - 编辑 `drizzle/schema.ts`
   - 运行 `pnpm db:push` 迁移数据库

2. **添加后端逻辑**
   - 在 `server/db.ts` 中添加数据库查询函数
   - 在 `server/routers.ts` 中添加 tRPC 路由

3. **编写测试**
   - 在 `server/*.test.ts` 中编写单元测试
   - 运行 `pnpm test` 验证

4. **开发前端页面**
   - 在 `client/src/pages/` 中创建新页面
   - 在 `client/src/App.tsx` 中注册路由
   - 使用 `trpc` hooks 调用后端 API

5. **样式设计**
   - 使用 Tailwind CSS 类
   - 遵循设计系统中的颜色和间距规范

## 📚 相关资源

- [OpenRouter 文档](https://openrouter.ai/docs)
- [Google Gemini API 文档](https://ai.google.dev/docs)
- [tRPC 文档](https://trpc.io)
- [Drizzle ORM 文档](https://orm.drizzle.team)
- [Tailwind CSS 文档](https://tailwindcss.com)

## 📞 支持和反馈

如有问题或建议，请提交 Issue 或 Pull Request。

---

**最后更新**：2024年12月23日
**项目版本**：1.0.0
**许可证**：MIT
