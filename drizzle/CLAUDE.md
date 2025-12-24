# 数据库模块文档

[根目录](../CLAUDE.md) > **drizzle**

> **最后更新**: 2025-12-23 21:50:24
> **模块类型**: 数据库层（Schema + 迁移）

---

## 变更记录 (Changelog)

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-12-23 | 初始化 | 首次生成数据库模块文档 |

---

## 模块职责

数据库模块负责：

- **Schema 定义**：使用 Drizzle ORM 定义表结构
- **迁移管理**：自动生成和执行数据库迁移
- **类型生成**：从 Schema 自动生成 TypeScript 类型
- **关系模型**：定义表之间的外键关系

---

## 入口与启动

### 核心文件

**Schema 定义**：`drizzle/schema.ts`

```typescript
export const users = mysqlTable("users", { ... });
export const imageGenerations = mysqlTable("imageGenerations", { ... });
export const imageEdits = mysqlTable("imageEdits", { ... });

export type User = typeof users.$inferSelect;
export type ImageGeneration = typeof imageGenerations.$inferSelect;
```

**关系定义**：`drizzle/relations.ts`

```typescript
// 定义表之间的关系（如需要）
```

**迁移配置**：`/drizzle.config.ts`（项目根目录）

```typescript
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
});
```

### 迁移命令

```bash
# 生成迁移文件
npx drizzle-kit generate

# 执行迁移
npx drizzle-kit migrate

# 一键生成并执行
pnpm db:push
# 执行：drizzle-kit generate && drizzle-kit migrate
```

---

## 对外接口（数据模型）

### 表结构

#### users（用户表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 主键 |
| openId | VARCHAR(64) | NOT NULL, UNIQUE | OAuth 用户 ID |
| name | TEXT | NULL | 用户名 |
| email | VARCHAR(320) | NULL | 邮箱 |
| loginMethod | VARCHAR(64) | NULL | 登录方式 |
| role | ENUM('user', 'admin') | NOT NULL, DEFAULT 'user' | 用户角色 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL, ON UPDATE NOW() | 更新时间 |
| lastSignedIn | TIMESTAMP | NOT NULL, DEFAULT NOW() | 最后登录时间 |

**TypeScript 类型**：
```typescript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
```

---

#### imageGenerations（图片生成记录）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 主键 |
| userId | INT | NOT NULL, FOREIGN KEY → users.id | 用户 ID |
| prompt | TEXT | NOT NULL | 生成提示词 |
| imageUrl | TEXT | NOT NULL | S3 图片 URL |
| imageKey | VARCHAR(512) | NULL | S3 Key |
| status | ENUM('pending', 'completed', 'failed') | NOT NULL, DEFAULT 'pending' | 生成状态 |
| errorMessage | TEXT | NULL | 错误信息 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL, ON UPDATE NOW() | 更新时间 |

**TypeScript 类型**：
```typescript
export type ImageGeneration = typeof imageGenerations.$inferSelect;
export type InsertImageGeneration = typeof imageGenerations.$inferInsert;
```

---

#### imageEdits（图片编辑记录）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 主键 |
| userId | INT | NOT NULL, FOREIGN KEY → users.id | 用户 ID |
| originalImageUrl | TEXT | NOT NULL | 原始图片 URL |
| originalImageKey | VARCHAR(512) | NULL | 原始图片 S3 Key |
| editPrompt | TEXT | NOT NULL | 编辑指令 |
| editedImageUrl | TEXT | NOT NULL | 编辑后图片 URL |
| editedImageKey | VARCHAR(512) | NULL | 编辑后图片 S3 Key |
| status | ENUM('pending', 'completed', 'failed') | NOT NULL, DEFAULT 'pending' | 编辑状态 |
| errorMessage | TEXT | NULL | 错误信息 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL, ON UPDATE NOW() | 更新时间 |

**TypeScript 类型**：
```typescript
export type ImageEdit = typeof imageEdits.$inferSelect;
export type InsertImageEdit = typeof imageEdits.$inferInsert;
```

---

## 关键依赖与配置

### 核心依赖

```json
{
  "drizzle-orm": "0.44.5",
  "drizzle-kit": "0.31.4",
  "mysql2": "3.15.0"
}
```

### 数据库连接

**配置**：通过环境变量 `DATABASE_URL`

```bash
DATABASE_URL=mysql://username:password@host:port/database
```

**初始化**：在 `server/db.ts` 中懒加载数据库连接

```typescript
import { drizzle } from 'drizzle-orm/mysql2';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}
```

---

## 目录结构

```
drizzle/
├── schema.ts               # 表结构定义
├── relations.ts            # 表关系定义
├── migrations/             # 迁移文件目录
│   ├── .gitkeep
│   ├── 0000_safe_ultimo.sql
│   └── 0001_deep_thor.sql
└── meta/                   # 迁移元数据
    ├── _journal.json
    ├── 0000_snapshot.json
    └── 0001_snapshot.json
```

---

## 数据模型关系

```
users (1) ──< (N) imageGenerations
users (1) ──< (N) imageEdits
```

- 一个用户可以有多条生成记录
- 一个用户可以有多条编辑记录

---

## 迁移历史

| 版本 | 文件 | 变更内容 |
|------|------|----------|
| 0000 | `0000_safe_ultimo.sql` | 初始化数据库表结构 |
| 0001 | `0001_deep_thor.sql` | 添加 `imageKey` 和 `editedImageKey` 字段 |

**查看迁移日志**：`drizzle/meta/_journal.json`

---

## 测试与质量

### 测试现状

- **Schema 验证**：通过 TypeScript 类型检查
- **迁移测试**：在开发/测试环境执行迁移验证
- **数据库操作测试**：在 `server/images.test.ts` 中测试

### 数据完整性

- **外键约束**：`userId` 外键关联 `users.id`
- **唯一约束**：`users.openId` 唯一
- **非空约束**：核心字段标记 `NOT NULL`
- **默认值**：时间戳字段自动填充

---

## 常见问题 (FAQ)

### Q1: 如何添加新表？

1. 在 `drizzle/schema.ts` 中定义新表：
   ```typescript
   export const myNewTable = mysqlTable("myNewTable", {
     id: int("id").autoincrement().primaryKey(),
     name: text("name").notNull(),
     createdAt: timestamp("createdAt").defaultNow().notNull()
   });

   export type MyNewTable = typeof myNewTable.$inferSelect;
   ```

2. 运行迁移：
   ```bash
   pnpm db:push
   ```

### Q2: 如何修改现有表结构？

1. 修改 `drizzle/schema.ts` 中的表定义
2. 生成迁移文件：`npx drizzle-kit generate`
3. 检查生成的 SQL 文件（在 `drizzle/` 目录）
4. 执行迁移：`npx drizzle-kit migrate`

**注意**：生产环境谨慎执行，建议先在测试环境验证。

### Q3: 如何回滚迁移？

Drizzle Kit 不直接支持回滚，需要手动：

1. 查看迁移历史：`drizzle/meta/_journal.json`
2. 手动执行反向 SQL（如 `DROP COLUMN`）
3. 或者：恢复数据库备份

### Q4: 如何查看生成的 SQL？

迁移文件位于 `drizzle/` 目录，例如：

```sql
-- drizzle/0000_safe_ultimo.sql
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) NOT NULL UNIQUE,
  ...
);
```

---

## 相关文件清单

### Schema 定义（2 个）

- `schema.ts`：表结构定义（users、imageGenerations、imageEdits）
- `relations.ts`：表关系定义

### 迁移文件（2 个）

- `0000_safe_ultimo.sql`：初始化表结构
- `0001_deep_thor.sql`：添加 S3 Key 字段

### 元数据（3 个）

- `meta/_journal.json`：迁移日志
- `meta/0000_snapshot.json`：第一个快照
- `meta/0001_snapshot.json`：第二个快照

---

## 数据查询示例

### 查询用户生成历史

```typescript
import { getDb } from './server/db';
import { imageGenerations } from './drizzle/schema';
import { eq, desc } from 'drizzle-orm';

const db = await getDb();
const history = await db
  .select()
  .from(imageGenerations)
  .where(eq(imageGenerations.userId, 1))
  .orderBy(desc(imageGenerations.createdAt))
  .limit(10);
```

### 插入生成记录

```typescript
await db.insert(imageGenerations).values({
  userId: 1,
  prompt: "白色帆布鞋",
  imageUrl: "https://s3.../image.png",
  imageKey: "images/generated/123.png",
  status: "completed"
});
```

---

**上级文档**：[根目录 CLAUDE.md](../CLAUDE.md)
**相关模块**：[后端模块](../server/CLAUDE.md) | [前端模块](../client/CLAUDE.md)
