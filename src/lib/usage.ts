import type { SupabaseClient } from "@supabase/supabase-js";

export const DAILY_LIMIT = 5;

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

// Counts the user's rows in summaries created since midnight UTC today.
// Pass the server client from src/lib/supabase/server.ts so the query runs
// as the logged-in user under RLS. Throws if the count can't be read.
export async function countSummariesToday(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("summaries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${todayUTC()}T00:00:00Z`);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
