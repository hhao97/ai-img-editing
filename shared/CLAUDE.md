# 共享模块文档

[根目录](../CLAUDE.md) > **shared**

> **最后更新**: 2025-12-23 21:50:24
> **模块类型**: 前后端共享代码

---

## 变更记录 (Changelog)

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-12-23 | 初始化 | 首次生成共享模块文档 |

---

## 模块职责

共享模块负责：

- **常量定义**：前后端共用的常量值
- **类型定义**：跨模块的 TypeScript 类型
- **错误处理**：通用错误类和错误消息
- **工具函数**：前后端都需要的工具函数（如有）

---

## 对外接口

### 常量（`shared/const.ts`）

```typescript
// Cookie 名称
export const COOKIE_NAME = "app_session_id";

// 时间常量
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// 超时配置
export const AXIOS_TIMEOUT_MS = 30_000;

// 错误消息
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
```

**使用示例**：

```typescript
// 前端
import { UNAUTHED_ERR_MSG } from '@shared/const';

// 后端
import { COOKIE_NAME } from '@shared/const';
```

---

### 类型定义（`shared/types.ts`）

```typescript
// 通用响应类型
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// 其他共享类型...
```

**使用示例**：

```typescript
import type { ApiResponse } from '@shared/types';

const response: ApiResponse<string> = {
  success: true,
  data: "操作成功"
};
```

---

### 错误处理（`shared/_core/errors.ts`）

```typescript
// 自定义错误类（如有）
export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
  }
}
```

---

## 关键依赖与配置

### 导入路径

**TypeScript 配置**：`/tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["./shared/*"]
    }
  }
}
```

**前端使用**：
```typescript
import { COOKIE_NAME } from '@shared/const';
```

**后端使用**：
```typescript
import { COOKIE_NAME } from '@shared/const';
```

---

## 目录结构

```
shared/
├── const.ts                # 全局常量
├── types.ts                # 通用类型定义
└── _core/                  # 框架核心共享
    └── errors.ts           # 错误类定义
```

---

## 文件清单

| 文件 | 行数 | 说明 |
|------|------|------|
| `const.ts` | 5 | 全局常量（Cookie 名称、超时、错误消息） |
| `types.ts` | 7 | 通用类型定义 |
| `_core/errors.ts` | 19 | 错误处理类 |

---

## 常见问题 (FAQ)

### Q1: 如何添加新的常量？

在 `shared/const.ts` 中添加：

```typescript
export const MY_NEW_CONSTANT = "value";
```

前后端都可以导入使用。

### Q2: 如何添加共享类型？

在 `shared/types.ts` 中添加：

```typescript
export type MyNewType = {
  id: number;
  name: string;
};
```

前后端都可以使用该类型。

### Q3: 为什么要共享常量？

避免前后端硬编码不一致，例如：

- Cookie 名称必须一致
- 错误代码必须一致
- 超时配置建议一致

---

**上级文档**：[根目录 CLAUDE.md](../CLAUDE.md)
**相关模块**：[前端模块](../client/CLAUDE.md) | [后端模块](../server/CLAUDE.md)
