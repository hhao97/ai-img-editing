-- ============================================
-- 强制清理所有表和枚举类型
-- ============================================

-- 删除所有表（按依赖顺序，CASCADE 会自动处理外键）
DROP TABLE IF EXISTS "imageEdits" CASCADE;
DROP TABLE IF EXISTS "imageGenerations" CASCADE;
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 删除可能存在的其他表名变体
DROP TABLE IF EXISTS "image_edits" CASCADE;
DROP TABLE IF EXISTS "image_generations" CASCADE;

-- 删除所有枚举类型
DROP TYPE IF EXISTS "status" CASCADE;
DROP TYPE IF EXISTS "role" CASCADE;

-- 显示确认信息
SELECT 'All tables and types dropped successfully!' as message;
