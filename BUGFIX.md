# BetterAuth 错误修复

## 修复时间
2025-12-24

## 遇到的问题

### 1. BetterAuth Drizzle Adapter 错误
```
[BetterAuthError]: [# Drizzle Adapter]: The model "user" was not found in the schema object.
Please pass the schema directly to the adapter options.
```

**原因**: BetterAuth 的 Drizzle 适配器需要明确的 schema 映射，不能自动推断。

**修复**: 在 `server/auth.ts` 中显式传递 schema 配置：

```typescript
database: drizzleAdapter(db!, {
  provider: "pg",
  schema: {
    user: schema.users,
    session: schema.sessions,
    account: schema.accounts,
  },
}),
```

### 2. 首页访问也报错（未登录用户）

**原因**: tRPC context 在获取 session 时可能抛出错误，影响公开页面访问。

**修复**: 改进 `server/_core/context.ts` 中的错误处理：
- 移除错误日志打印（未登录不是错误）
- 确保所有错误都被正确捕获并返回 `user: null`

## 修复的文件

| 文件 | 修改内容 |
|------|---------|
| `server/auth.ts` | 添加明确的 schema 映射 |
| `server/_core/context.ts` | 改进错误处理，移除不必要的日志 |

## 验证步骤

### 1. 启动应用
```bash
pnpm dev
```

应该看到：
```
Server running on http://localhost:3000/
```

不应该再看到 `BetterAuthError` 错误。

### 2. 访问首页（未登录）
访问 http://localhost:3000

**预期结果**: 页面正常加载，无错误

### 3. 测试注册
访问 http://localhost:3000/register

填写信息：
- 姓名：测试用户
- 邮箱：test@example.com
- 密码：123456（或更长）

**预期结果**:
- 注册成功
- 自动登录
- 跳转到首页
- 显示用户信息

### 4. 测试登录
访问 http://localhost:3000/login

使用刚才注册的账号登录。

**预期结果**: 登录成功并跳转

### 5. 测试登出
在已登录状态下，点击登出按钮。

**预期结果**: 成功登出，跳转到登录页

## 数据库表结构

BetterAuth 使用以下表：

### users 表
```sql
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(320) NOT NULL UNIQUE,
  "emailVerified" BOOLEAN DEFAULT FALSE NOT NULL,
  "name" TEXT,
  "image" TEXT,
  "passwordHash" TEXT,
  "openId" VARCHAR(64) UNIQUE,
  "loginMethod" VARCHAR(64),
  "role" VARCHAR DEFAULT 'user' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### sessions 表
```sql
CREATE TABLE "sessions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### accounts 表
```sql
CREATE TABLE "accounts" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" VARCHAR(64) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  "refreshToken" TEXT,
  "accessToken" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## 技术细节

### BetterAuth 配置
- **认证方式**: 邮箱密码（email + password）
- **邮箱验证**: 禁用（`requireEmailVerification: false`）
- **密码要求**: 最少 6 个字符
- **会话有效期**: 7 天
- **Cookie 缓存**: 5 分钟

### tRPC 认证
- **公开路由**: 不需要登录即可访问
- **受保护路由**: 使用 `protectedProcedure`，需要登录
- **用户信息**: 通过 `ctx.user` 获取

## 常见问题

### Q: 注册时提示邮箱已存在？
A: 该邮箱已被注册，请使用不同的邮箱或直接登录。

### Q: 登录后仍然显示未登录？
A: 检查浏览器 Cookie 是否启用。BetterAuth 使用 HTTP-only Cookie 存储会话。

### Q: 密码太短无法注册？
A: 密码至少需要 6 个字符。可以在 `server/auth.ts` 中修改 `minPasswordLength`。

### Q: 如何重置密码？
A: 当前版本未实现密码重置功能。需要手动在数据库中更新 `passwordHash` 字段。

## 下一步

1. 启动应用：`pnpm dev`
2. 测试注册和登录功能
3. 确认首页在未登录状态下也能正常访问
4. 开始使用 AI 商品图生成功能

---

**修复完成时间**: 2025-12-24
**测试状态**: 待验证
