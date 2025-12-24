import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { auth } from "../auth";
import { getUserById } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // 使用 BetterAuth 验证请求
    const session = await auth.api.getSession({
      headers: opts.req.headers,
    });

    if (session?.user?.id) {
      // 从数据库获取完整的用户信息
      const dbUser = await getUserById(session.user.id);
      if (dbUser) {
        user = dbUser;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    // 未登录不是错误，所以不打印日志
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
