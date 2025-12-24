import { pgTable, pgEnum, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

/**
 * User roles enum
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Core user table - BetterAuth 标准 schema（单数表名）
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),

  // 自定义字段
  role: roleEnum("role").default("user").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type User = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;

/**
 * Sessions table - BetterAuth 标准 schema
 */
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export type Session = typeof session.$inferSelect;
export type InsertSession = typeof session.$inferInsert;

/**
 * Accounts table - BetterAuth 标准 schema（包含 accountId）
 */
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(), // BetterAuth 必需字段
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"), // 邮箱密码认证使用
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export type Account = typeof account.$inferSelect;
export type InsertAccount = typeof account.$inferInsert;

/**
 * Verification table - BetterAuth 邮箱验证
 */
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/**
 * Status enum for image operations
 */
export const statusEnum = pgEnum("status", ["pending", "completed", "failed"]);

/**
 * Image generation records - stores user-generated images from text prompts
 */
export const imageGenerations = pgTable("imageGenerations", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey"), // S3 key for reference
  status: statusEnum("status").default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ImageGeneration = typeof imageGenerations.$inferSelect;
export type InsertImageGeneration = typeof imageGenerations.$inferInsert;

/**
 * Image edit records - stores images edited with AI modifications
 */
export const imageEdits = pgTable("imageEdits", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  originalImageUrl: text("originalImageUrl").notNull(),
  originalImageKey: text("originalImageKey"),
  editPrompt: text("editPrompt").notNull(),
  editedImageUrl: text("editedImageUrl").notNull(),
  editedImageKey: text("editedImageKey"),
  status: statusEnum("status").default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ImageEdit = typeof imageEdits.$inferSelect;
export type InsertImageEdit = typeof imageEdits.$inferInsert;

/**
 * Inspiration category enum
 */
export const inspirationCategoryEnum = pgEnum("inspiration_category", [
  "fashion",    // 服装
  "shoes",      // 鞋类
  "accessories", // 配饰
  "home",       // 家居
  "electronics", // 数码
  "beauty",     // 美妆
  "food",       // 食品
  "other",      // 其他
]);

/**
 * Inspirations table - prompt templates with example images
 */
export const inspirations = pgTable("inspirations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(), // 标题
  prompt: text("prompt").notNull(), // 提示词模板
  imageUrl: text("imageUrl").notNull(), // 示例图片 URL
  imageKey: text("imageKey"), // S3 key for reference
  category: inspirationCategoryEnum("category").notNull(), // 分类
  tags: text("tags").array(), // 标签数组
  note: text("note"), // 使用说明/提示
  orderWeight: text("orderWeight").default("0"), // 排序权重（数字字符串）
  isActive: boolean("isActive").default(true).notNull(), // 是否启用
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Inspiration = typeof inspirations.$inferSelect;
export type InsertInspiration = typeof inspirations.$inferInsert;