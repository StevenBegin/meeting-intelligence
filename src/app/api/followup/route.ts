import { NextResponse } from "next/server";
import OpenAI from "openai";
import { toneSentence } from "@/lib/tone";

const SYSTEM_PROMPT =
  "You are a meeting organizer writing a follow-up email. You will be given " +
  "a meeting transcript and its summary (executive summary, key decisions, " +
  "action items). Reply with JSON only, with exactly these keys: subject " +
  "(a short string), body (a string). The body should be a short, clear " +
  "email that covers what was decided, who owns what, and by when. Use the " +
  "action item owners and due dates from the summary. Do not invent details " +
  "that are not in the transcript or summary.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const transcript = body?.transcript;
  const summary = body?.summary;

  if (typeof transcript !== "string" || transcript.trim().length === 0) {
    return NextResponse.json(
      { error: "Transcript is required." },
      { status: 400 }
    );
  }

  if (!summary || typeof summary !== "object") {
    return NextResponse.json(
      { error: "Summary is required." },
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
        {
          role: "user",
          content: JSON.stringify({ transcript, summary }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from model");
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("followup failed:", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
