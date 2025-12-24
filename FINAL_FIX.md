# 最终修复步骤

## 问题总结

1. **数据库 ID 类型冲突**：BetterAuth 使用字符串 ID，但数据库使用整数自增 ID
2. **首页使用旧 OAuth**：需要移除 Manus OAuth 相关代码

## 🔧 修复步骤

### 第1步：清理 Supabase 数据库表

1. 访问 [Supabase SQL Editor](https://supabase.com/dashboard/project/cpvdbsvrhmrgkayzlgts/sql)

2. 执行以下 SQL 删除所有旧表：

```sql
-- 删除所有表以重新开始（谨慎使用！会删除所有数据）
DROP TABLE IF EXISTS "imageEdits" CASCADE;
DROP TABLE IF EXISTS "imageGenerations" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 删除枚举类型
DROP TYPE IF EXISTS "status" CASCADE;
DROP TYPE IF EXISTS "role" CASCADE;
```

3. 点击 **Run** 执行 SQL

### 第2步：重新生成数据库表

在项目目录执行：

```bash
cd /Users/huanghao/Downloads/ai-ecommerce-image-gen\ 4
npx drizzle-kit push
```

应该看到：
```
[✓] Changes applied
```

### 第3步：测试应用

```bash
pnpm dev
```

访问 https://ai-img.zeabur.app//register 测试注册。

## 📝 已修改的文件

| 文件 | 更改内容 |
|------|---------|
| `drizzle/schema.ts` | 所有表的 ID 改为 `text` 类型 |
| `server/db.ts` | 更新函数参数类型为 `string` |
| `server/_core/context.ts` | 移除 `Number()` 类型转换 |

## 🔑 数据库 Schema 变化

### 之前（整数 ID）
```typescript
id: integer("id").primaryKey().generatedAlwaysAsIdentity()
userId: integer("userId").references(() => users.id)
```

### 现在（字符串 ID）
```typescript
id: text("id").primaryKey()
userId: text("userId").references(() => users.id)
```

### ID 生成方式
- **users**: BetterAuth 自动生成（如 `j54F4LdDxuwlS7gIDMyJeihOH7zjsd6q`）
- **sessions**: BetterAuth 自动生成
- **accounts**: BetterAuth 自动生成
- **imageGenerations**: 手动生成（如 `img_gen_1735019275_abc123`）
- **imageEdits**: 手动生成（如 `img_edit_1735019275_xyz789`）

## 📚 为什么使用字符串 ID？

1. **BetterAuth 默认行为**：BetterAuth 默认使用字符串 ID（类似 UUID）
2. **更好的安全性**：字符串 ID 不可预测，防止枚举攻击
3. **跨数据库兼容性**：不依赖数据库的自增特性
4. **分布式友好**：字符串 ID 可在分布式环境中生成，无冲突

## ❗常见问题

### Q: 执行 DROP TABLE 时提示权限不足？

A: 确保你在 Supabase Dashboard 的 SQL Editor 中执行，而不是本地终端。

### Q: drizzle-kit push 失败？

A: 确保已经删除了所有旧表。可以在 Supabase 的 Table Editor 中手动检查。

### Q: 注册后提示 ID 错误？

A: 清除浏览器缓存和 Cookie，重新访问注册页面。

### Q: 旧数据如何迁移？

A: 如果有旧数据需要保留，建议：
1. 导出旧数据（CSV 格式）
2. 创建转换脚本，将整数 ID 转为字符串
3. 导入到新表

## 🎯 验证步骤

1. ✅ 数据库表已删除并重建
2. ✅ 应用启动无错误
3. ✅ 注册功能正常
4. ✅ 登录功能正常
5. ✅ 首页可以未登录访问

---

**修复日期**：2025-12-24
**预计时间**：5-10 分钟
