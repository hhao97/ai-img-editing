export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // BetterAuth
  betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? "",
  betterAuthBaseUrl:
    process.env.BETTER_AUTH_BASE_URL ?? "https://ai-img.zeabur.app/",

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "images",

  // OpenRouter (optional)
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
};
