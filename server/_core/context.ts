import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "../supabase";

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
    // 从请求头中获取 Authorization token
    const authHeader = opts.req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ') && supabaseAdmin) {
      const token = authHeader.substring(7);

      // 验证 JWT token
      const { data, error } = await supabaseAdmin.auth.getUser(token);

      if (!error && data.user) {
        user = data.user;
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
