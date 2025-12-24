import { createAuthClient } from "better-auth/client";

/**
 * BetterAuth 客户端配置
 * 用于前端的认证操作（注册、登录、登出等）
 */
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // 生产环境需要替换为实际域名
});

/**
 * 导出常用的认证方法
 */
export const { signIn, signUp, signOut, useSession } = authClient;
