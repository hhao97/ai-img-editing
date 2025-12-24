import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "../drizzle/schema";

/**
 * BetterAuth 配置
 * 使用 Drizzle ORM 适配器连接到 Supabase PostgreSQL
 */
export const auth = betterAuth({
  // 数据库配置
  database: drizzleAdapter(db!, {
    provider: "pg", // Supabase 使用 PostgreSQL
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // 邮箱密码认证
  emailAndPassword: {
    enabled: true,
    // 禁用邮箱验证
    requireEmailVerification: false,
    // 密码最小长度
    minPasswordLength: 6,
    // 密码强度要求（可选）
    maxPasswordLength: 128,
  },

  // 会话配置
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
    updateAge: 60 * 60 * 24, // 每天更新一次
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 分钟
    },
  },

  // 基础配置
  baseURL: process.env.BETTER_AUTH_BASE_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,

  // 信任的域名
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
  ],
});

export type Auth = typeof auth;
