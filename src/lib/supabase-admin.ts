import { createClient } from "@supabase/supabase-js";

/**
 * サービスロールキーを使用するSupabaseクライアント
 * Storage操作やRLSをバイパスする必要がある操作に使用
 * サーバーサイドのみで使用すること
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
