import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { resolveTone, toneSentence } from "@/lib/tone";
import { createClient } from "@/lib/supabase/server";
import { DAILY_LIMIT, countSummariesToday } from "@/lib/usage";

const SYSTEM_PROMPT =
  "You are a meeting analyst. Read the transcript and reply with JSON only, " +
  "with exactly these keys: summary (a string, 3 sentences maximum), " +
  "key_decisions (an array of short strings), action_items (an array of " +
  "objects with keys owner, task, due). If something is unknown, use an " +
  "empty string or empty array. Do not invent details that are not in the " +
  "transcript. Every action item must include a due date taken from the " +
  "transcript in the form 'Month D'. If no date is stated, set due to the " +
  "word 'none'. Never leave due blank.";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Please log in to summarize a transcript.",
      },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const transcript = body?.transcript;

  if (typeof transcript !== "string" || transcript.trim().length === 0) {
    return NextResponse.json(
      { error: "Transcript is required." },
      { status: 400 }
    );
  }

  // Per-user daily cap: count this user's summaries created today (UTC).
  // Runs on the server as the logged-in user; nothing from the browser is
  // trusted for the count.
  let currentCount: number;
  try {
    currentCount = await countSummariesToday(supabase, user.id);
  } catch (usageReadError) {
    // Fail closed: if we cannot read the count, do not spend an AI call.
    console.error("usage lookup failed:", usageReadError);
    return NextResponse.json({ error: "usage_failed" }, { status: 503 });
  }

  if (currentCount >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: "limit",
        message: "You've hit today's limit of 5 summaries. Come back tomorrow.",
      },
      { status: 429 }
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

    // Save to history. user_id comes only from the server session, and the
    // insert uses the session client so RLS checks it. This row is also what
    // the daily cap counts. A failure here is logged but never blocks
    // returning the summary.
    try {
      const { error: historyWriteError } = await supabase
        .from("summaries")
        .insert({
          user_id: user.id,
          transcript,
          summary: typeof parsed.summary === "string" ? parsed.summary : "",
          key_decisions: Array.isArray(parsed.key_decisions)
            ? parsed.key_decisions
            : [],
          action_items: Array.isArray(parsed.action_items)
            ? parsed.action_items
            : [],
          email_subject:
            typeof parsed.email_subject === "string"
              ? parsed.email_subject
              : null,
          email_body:
            typeof parsed.email_body === "string" ? parsed.email_body : null,
          tone: resolveTone(body?.tone),
        });

      if (historyWriteError) {
        console.error("history insert failed:", historyWriteError);
      }
    } catch (historyErr) {
      console.error("history insert failed:", historyErr);
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("summarize failed:", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
