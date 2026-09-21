import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { ANON_COOKIE_NAME, DAILY_LIMIT, todayUTC } from "@/lib/usage";

export async function GET(request: NextRequest) {
  try {
    const anonId = request.cookies.get(ANON_COOKIE_NAME)?.value;

    if (!anonId) {
      return NextResponse.json({ count: 0, limit: DAILY_LIMIT });
    }

    const { data, error } = await supabaseServer
      .from("usage")
      .select("count")
      .eq("anon_id", anonId)
      .eq("day", todayUTC())
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ count: data?.count ?? 0, limit: DAILY_LIMIT });
  } catch (err) {
    console.error("usage lookup failed:", err);
    return NextResponse.json({ error: "usage_failed" }, { status: 500 });
  }
}
