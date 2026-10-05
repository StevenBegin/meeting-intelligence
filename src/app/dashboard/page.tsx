import { redirect } from "next/navigation";
import HistoryList, { type HistoryItem } from "@/components/HistoryList";
import Summarizer from "@/components/Summarizer";
import { createClient } from "@/lib/supabase/server";
import { DAILY_LIMIT, countSummariesToday } from "@/lib/usage";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: history, error: historyError } = await supabase
    .from("summaries")
    .select("id, created_at, tone, summary, key_decisions, action_items")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (historyError) {
    console.error("history load failed:", historyError);
  }

  // Display only. The summarize route re-counts on the server before every
  // AI call, so this number is never trusted for enforcement.
  let usageCount = 0;
  try {
    usageCount = await countSummariesToday(supabase, user.id);
  } catch (usageError) {
    console.error("usage count failed:", usageError);
  }

  return (
    <div className="flex flex-1 justify-center bg-white px-4 py-10 sm:px-6">
      <main className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#1B2A41] sm:text-3xl">
            Meeting Intelligence
          </h1>
          <p className="break-all text-sm text-gray-600">
            Signed in as{" "}
            <span className="font-medium text-[#1B2A41]">{user.email}</span>
          </p>
        </div>

        <Summarizer usageCount={usageCount} usageLimit={DAILY_LIMIT} />

        <HistoryList
          items={(history ?? []) as HistoryItem[]}
          loadFailed={!!historyError}
        />
      </main>
    </div>
  );
}
