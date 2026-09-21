export type Tone = "Formal" | "Friendly" | "Executive";

const TONE_SENTENCES: Record<Tone, string> = {
  Formal:
    "Write in a formal tone: complete sentences, no slang, no exclamation marks.",
  Friendly: "Write in a friendly tone: warm, plain, use first names.",
  Executive:
    "Write in an executive tone: short, decisions first, no fluff.",
};

export function resolveTone(value: unknown): Tone {
  if (value === "Formal" || value === "Friendly" || value === "Executive") {
    return value;
  }
  return "Friendly";
}

export function toneSentence(value: unknown): string {
  return TONE_SENTENCES[resolveTone(value)];
}
