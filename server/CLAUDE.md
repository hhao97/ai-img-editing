# 后端模块文档

[根目录](../CLAUDE.md) > **server**

> **最后更新**: 2025-12-23 21:50:24
> **模块类型**: 后端服务（Express + tRPC）

---

## 变更记录 (Changelog)

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-12-23 | 初始化 | 首次生成后端模块文档 |

---

## 模块职责

后端服务模块负责：

- **HTTP 服务器**：基于 Express 4 的 Web 服务器
- **API 服务**：通过 tRPC 11 提供类型安全的 RPC 接口
- **业务逻辑**：图片生成、编辑、历史查询、用户认证
- **第三方集成**：
  - OpenRouter API（Google Gemini 2.5 Flash）
  - AWS S3 / Manus Forge Storage
  - Manus OAuth 认证
- **数据库操作**：通过 Drizzle ORM 管理 MySQL 数据
- **会话管理**：JWT Cookie 认证

---

## 入口与启动

### 入口文件

**主入口**：`server/_core/index.ts`

```typescript
// 启动 Express 服务器
async function startServer() {
  const app = express();
  const server = createServer(app);

  // 注册 OAuth 路由
  registerOAuthRoutes(app);

  // 注册 tRPC 路由
  app.use('/api/trpc', createExpressMiddleware({
    router: appRouter,
    createContext
  }));

  // 开发模式：Vite 中间件
  // 生产模式：静态文件服务
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
```

### 启动命令

```bash
# 开发模式（热重载）
pnpm dev
# 执行：NODE_ENV=development tsx watch server/_core/index.ts

# 生产模式
pnpm build && pnpm start
# 执行：NODE_ENV=production node dist/index.js
```

---

## 对外接口（tRPC 路由）

**定义文件**：`server/routers.ts`

### 认证路由（`auth.*`）

#### `auth.me`
- **类型**：Query
- **权限**：公开
- **返回**：当前用户信息（`User | undefined`）
- **用途**：前端获取登录状态

#### `auth.logout`
- **类型**：Mutation
- **权限**：公开
- **返回**：`{ success: true }`
- **用途**：清除 Cookie，登出用户

---

### 图片生成路由（`images.*`）

#### `images.generate`
- **类型**：Mutation
- **权限**：需登录（`protectedProcedure`）
- **输入**：
  ```typescript
  {
    prompt: string,  // 商品描述（1-500 字符）
    apiKey: string   // OpenRouter API Key
  }
  ```
- **输出**：
  ```typescript
  {
    success: boolean,
    imageUrl: string  // S3 URL
  }
  ```
- **流程**：
  1. 调用 OpenRouter API 生成图片
  2. 上传 base64 图片到 S3
  3. 保存记录到 `imageGenerations` 表
  4. 返回 S3 URL

#### `images.getHistory`
- **类型**：Query
- **权限**：需登录
- **输入**：`{ limit: number }`（默认 20）
- **输出**：`ImageGeneration[]`
- **用途**：获取用户的生成历史

#### `images.edit`
- **类型**：Mutation
- **权限**：需登录
- **输入**：
  ```typescript
  {
    imageUrl: string,      // 原始图片 URL
    editPrompt: string,    // 编辑指令（1-500 字符）
    apiKey: string
  }
  ```
- **输出**：
  ```typescript
  {
    success: boolean,
    editedImageUrl: string
  }
  ```

#### `images.getEditHistory`
- **类型**：Query
- **权限**：需登录
- **输入**：`{ limit: number }`
- **输出**：`ImageEdit[]`

#### `images.uploadImage`
- **类型**：Mutation
- **权限**：需登录
- **输入**：
  ```typescript
  {
    fileName: string,
    fileData: string,  // base64 编码
    mimeType: string
  }
  ```
- **输出**：
  ```typescript
  {
    success: boolean,
    url: string,     // S3 URL
    fileKey: string  // S3 Key
  }
  ```

---

### 系统路由（`system.*`）

**定义文件**：`server/_core/systemRouter.ts`

- `system.notifyOwner`：通知项目所有者
- 其他系统级功能...

---

## 关键依赖与配置

### 核心依赖

```json
{
  "express": "4.21.2",
  "@trpc/server": "11.6.0",
  "drizzle-orm": "0.44.5",
  "mysql2": "3.15.0",
  "jose": "6.1.0",
  "zod": "4.1.12",
  "cookie": "1.0.2",
  "dotenv": "17.2.2"
}
```

### 环境变量

**配置文件**：`server/_core/env.ts`

```typescript
export const ENV = {
  appId: process.env.VITE_APP_ID,
  cookieSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  oAuthServerUrl: process.env.OAUTH_SERVER_URL,
  ownerOpenId: process.env.OWNER_OPEN_ID,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL,
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY,
  isProduction: process.env.NODE_ENV === 'production'
};
```

---

## 目录结构

```
server/
├── _core/                  # Manus 框架核心
│   ├── index.ts            # 服务器入口
│   ├── context.ts          # tRPC 上下文（用户、请求、响应）
│   ├── trpc.ts             # tRPC 配置（publicProcedure、protectedProcedure）
│   ├── oauth.ts            # OAuth 认证流程
│   ├── env.ts              # 环境变量管理
│   ├── cookies.ts          # Cookie 处理工具
│   ├── vite.ts             # Vite 中间件（开发模式）
│   ├── llm.ts              # LLM 集成（通用）
│   ├── imageGeneration.ts  # 图片生成工具（通用）
│   ├── voiceTranscription.ts # 语音转录工具
│   ├── map.ts              # 地图服务
│   ├── notification.ts     # 通知服务
│   ├── sdk.ts              # SDK 工具
│   ├── dataApi.ts          # 数据 API
│   ├── systemRouter.ts     # 系统路由
│   └── types/              # 类型定义
│       ├── cookie.d.ts
│       └── manusTypes.ts
│
├── routers.ts              # tRPC 路由定义（业务核心）
├── db.ts                   # 数据库操作封装
├── openrouter.ts           # OpenRouter API 集成
├── storage.ts              # S3 文件存储
│
└── *.test.ts               # 单元测试（3 个文件，27 个测试）
    ├── auth.logout.test.ts
    ├── openrouter.test.ts
    └── images.test.ts
```

---

## 数据库操作

**封装文件**：`server/db.ts`

### 核心函数

#### 用户相关

```typescript
// 创建或更新用户
async function upsertUser(user: InsertUser): Promise<void>

// 根据 openId 查询用户
async function getUserByOpenId(openId: string): Promise<User | undefined>
```

#### 图片生成

```typescript
// 创建图片生成记录
async function createImageGeneration(
  userId: number,
  prompt: string,
  imageUrl: string,
  imageKey?: string
): Promise<void>

// 获取用户生成历史
async function getUserImageGenerations(
  userId: number,
  limit: number = 20
): Promise<ImageGeneration[]>
```

#### 图片编辑

```typescript
// 创建图片编辑记录
async function createImageEdit(
  userId: number,
  originalImageUrl: string,
  editPrompt: string,
  editedImageUrl: string,
  originalImageKey?: string,
  editedImageKey?: string
): Promise<void>

// 获取用户编辑历史
async function getUserImageEdits(
  userId: number,
  limit: number = 20
): Promise<ImageEdit[]>
```

---

## OpenRouter API 集成

**文件**：`server/openrouter.ts`

### 配置

```typescript
const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const GEMINI_MODEL = "google/gemini-2.5-flash-image-preview";
```

### 核心函数

#### 图片生成

```typescript
async function generateImageFromPrompt(
  apiKey: string,
  prompt: string
): Promise<{ imageUrl: string }>
```

**流程**：
1. 发送 POST 请求到 `/chat/completions`
2. 携带 prompt 和模型名称
3. 提取返回的 base64 图片
4. 上传到 S3
5. 返回 S3 URL

#### 图片编辑

```typescript
async function editImageWithPrompt(
  apiKey: string,
  imageUrl: string,
  editPrompt: string
): Promise<{ imageUrl: string }>
```

**流程**：
1. 发送 POST 请求，携带原始图片 URL 和编辑指令
2. AI 返回编辑后的图片（base64）
3. 上传到 S3
4. 返回 S3 URL

#### API Key 验证

```typescript
async function validateApiKey(apiKey: string): Promise<boolean>
```

---

## 文件存储

**文件**：`server/storage.ts`

### 配置

使用 **Manus Forge Storage**（兼容 S3 接口）：

```typescript
function getStorageConfig(): { baseUrl: string, apiKey: string } {
  return {
    baseUrl: ENV.forgeApiUrl,
    apiKey: ENV.forgeApiKey
  };
}
```

### 核心函数

#### 上传文件

```typescript
async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string = 'application/octet-stream'
): Promise<{ key: string, url: string }>
```

**示例**：
```typescript
const fileKey = `images/generated/${Date.now()}.png`;
const imageBuffer = Buffer.from(base64Data, 'base64');
const { url } = await storagePut(fileKey, imageBuffer, 'image/png');
```

#### 获取文件

```typescript
async function storageGet(relKey: string): Promise<{ key: string, url: string }>
```

---

## 测试与质量

### 测试文件

#### `server/openrouter.test.ts`（13 个测试）

- 测试 `generateImageFromPrompt`
- 测试 `editImageWithPrompt`
- 测试 `validateApiKey`
- 错误处理测试

#### `server/images.test.ts`（13 个测试）

- 测试数据库操作（创建、查询）
- 测试 tRPC 路由逻辑
- 测试输入验证（Zod Schema）

#### `server/auth.logout.test.ts`（1 个测试）

- 测试登出流程（清除 Cookie）

### 运行测试

```bash
pnpm test
# 执行：vitest run
```

---

## 常见问题 (FAQ)

### Q1: 如何添加新的 tRPC 路由？

1. 在 `server/routers.ts` 中定义路由：
   ```typescript
   export const appRouter = router({
     myNewRoute: router({
       myAction: protectedProcedure
         .input(z.object({ ... }))
         .mutation(async ({ ctx, input }) => {
           // 业务逻辑
         })
     })
   });
   ```
2. 前端自动获得类型推导

### Q2: 如何修改 OpenRouter 模型？

修改 `server/openrouter.ts` 中的 `GEMINI_MODEL` 常量：
```typescript
const GEMINI_MODEL = "openai/gpt-4-vision-preview";
```

### Q3: 如何更换存储服务？

修改 `server/storage.ts`，替换 `storagePut` 和 `storageGet` 的实现：
```typescript
// 例如：使用 AWS SDK
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function storagePut(...) {
  const client = new S3Client({ ... });
  await client.send(new PutObjectCommand({ ... }));
}
```

### Q4: 数据库连接失败怎么办？

1. 检查 `DATABASE_URL` 环境变量
2. 确认数据库服务运行中
3. 查看日志：`[Database] Failed to connect:`
4. 测试连接：
   ```bash
   mysql -h <host> -u <user> -p <database>
   ```

---

## 相关文件清单

### 核心业务文件（5 个）

- `routers.ts`：tRPC 路由定义（业务核心）
- `db.ts`：数据库操作封装
- `openrouter.ts`：OpenRouter API 集成
- `storage.ts`：文件存储服务
- `_core/index.ts`：服务器启动入口

### 框架核心文件（15+ 个）

- `_core/context.ts`：tRPC 上下文
- `_core/trpc.ts`：tRPC 配置
- `_core/oauth.ts`：OAuth 认证
- `_core/env.ts`：环境变量
- `_core/cookies.ts`：Cookie 工具
- `_core/vite.ts`：Vite 中间件
- `_core/llm.ts`：LLM 集成
- `_core/imageGeneration.ts`：图片生成
- `_core/map.ts`：地图服务
- `_core/notification.ts`：通知服务
- `_core/sdk.ts`：SDK 工具
- `_core/dataApi.ts`：数据 API
- `_core/systemRouter.ts`：系统路由

### 测试文件（3 个）

- `auth.logout.test.ts`
- `openrouter.test.ts`
- `images.test.ts`

---

**上级文档**：[根目录 CLAUDE.md](../CLAUDE.md)
**相关模块**：[前端模块](../client/CLAUDE.md) | [数据库模块](../drizzle/CLAUDE.md)
