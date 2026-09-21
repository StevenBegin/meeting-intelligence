import { NextResponse } from "next/server";
import OpenAI from "openai";
import { toneSentence } from "@/lib/tone";

const SYSTEM_PROMPT =
  "You are a meeting analyst. Read the transcript and reply with JSON only, " +
  "with exactly these keys: summary (a string, 3 sentences maximum), " +
  "key_decisions (an array of short strings), action_items (an array of " +
  "objects with keys owner, task, due). If something is unknown, use an " +
  "empty string or empty array. Do not invent details that are not in the " +
  "transcript. Every action item must include a due date taken from the " +
  "transcript in the form 'Month D'. If no date is stated, set due to the " +
  "word 'none'. Never leave due blank.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const transcript = body?.transcript;

  if (typeof transcript !== "string" || transcript.trim().length === 0) {
    return NextResponse.json(
      { error: "Transcript is required." },
      { status: 400 }
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
    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("summarize failed:", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
