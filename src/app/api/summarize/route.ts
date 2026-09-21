import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { toneSentence } from "@/lib/tone";
import { supabaseServer } from "@/lib/supabaseServer";

const SYSTEM_PROMPT =
  "You are a meeting analyst. Read the transcript and reply with JSON only, " +
  "with exactly these keys: summary (a string, 3 sentences maximum), " +
  "key_decisions (an array of short strings), action_items (an array of " +
  "objects with keys owner, task, due). If something is unknown, use an " +
  "empty string or empty array. Do not invent details that are not in the " +
  "transcript. Every action item must include a due date taken from the " +
  "transcript in the form 'Month D'. If no date is stated, set due to the " +
  "word 'none'. Never leave due blank.";

const DAILY_LIMIT = 5;

const ANON_COOKIE_NAME = "mi_anon_id";
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function withAnonCookie(
  response: NextResponse,
  anonId: string,
  isNewAnonId: boolean
): NextResponse {
  if (isNewAnonId) {
    response.cookies.set(ANON_COOKIE_NAME, anonId, {
      httpOnly: true,
      maxAge: ANON_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const transcript = body?.transcript;

  if (typeof transcript !== "string" || transcript.trim().length === 0) {
    return NextResponse.json(
      { error: "Transcript is required." },
      { status: 400 }
    );
  }

  const existingAnonId = request.cookies.get(ANON_COOKIE_NAME)?.value;
  const isNewAnonId = !existingAnonId;
  const anonId = existingAnonId || randomUUID();
  const day = todayUTC();

  const { data: usageRow, error: usageReadError } = await supabaseServer
    .from("usage")
    .select("count")
    .eq("anon_id", anonId)
    .eq("day", day)
    .maybeSingle();

  if (usageReadError) {
    console.error("usage lookup failed:", usageReadError);
  }

  const currentCount = usageRow?.count ?? 0;

  if (currentCount >= DAILY_LIMIT) {
    return withAnonCookie(
      NextResponse.json(
        {
          error: "limit",
          message:
            "You've hit today's limit of 5 summaries. Come back tomorrow.",
        },
        { status: 429 }
      ),
      anonId,
      isNewAnonId
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
  });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT} ${toneSentence(body?.tone)}`,
        },
        { role: "user", content: transcript },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from model");
    }

    const parsed = JSON.parse(content);

    const { error: usageWriteError } = await supabaseServer
      .from("usage")
      .upsert(
        { anon_id: anonId, day, count: currentCount + 1 },
        { onConflict: "anon_id,day" }
      );

    if (usageWriteError) {
      console.error("usage update failed:", usageWriteError);
    }

    return withAnonCookie(
      NextResponse.json(parsed, { status: 200 }),
      anonId,
      isNewAnonId
    );
  } catch (err) {
    console.error("summarize failed:", err);
    return withAnonCookie(
      NextResponse.json({ error: "ai_failed" }, { status: 502 }),
      anonId,
      isNewAnonId
    );
  }
}
