"use client";

import { useState } from "react";
import Results, { SummaryResult } from "@/components/Results";
import { Tone } from "@/lib/tone";

type FollowupResult = {
  subject: string;
  body: string;
};

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);

  const [tone, setTone] = useState<Tone>("Friendly");
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState("");
  const [followup, setFollowup] = useState<FollowupResult | null>(null);
  const [followupTone, setFollowupTone] = useState<Tone | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setFollowup(null);
    setFollowupError("");
    setFollowupTone(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, tone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "The AI could not process this transcript.");
        setResult(null);
      } else {
        setResult(data);
      }
    } catch {
      setError("The AI could not process this transcript.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftFollowup = async () => {
    if (!result) return;

    setFollowupLoading(true);
    setFollowupError("");

    try {
      const response = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, summary: result, tone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFollowupError(
          data?.error || "The AI could not draft a follow-up email."
        );
        setFollowup(null);
      } else {
        setFollowup(data);
        setFollowupTone(tone);
        setCopyLabel("Copy");
      }
    } catch {
      setFollowupError("The AI could not draft a follow-up email.");
      setFollowup(null);
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!followup) return;

    try {
      await navigator.clipboard.writeText(
        `${followup.subject}\n\n${followup.body}`
      );
      setCopyLabel("Copied");
      setTimeout(() => setCopyLabel("Copy"), 2000);
    } catch {
      setCopyLabel("Copy failed");
      setTimeout(() => setCopyLabel("Copy"), 2000);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-white px-4 py-10 sm:px-6">
      <main className="flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-[#1B2A41] sm:text-3xl">
          Meeting Intelligence
        </h1>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="transcript"
            className="text-sm font-medium text-[#1B2A41]"
          >
            Paste your meeting transcript
          </label>
          <textarea
            id="transcript"
            rows={12}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            autoComplete="off"
            className="w-full resize-y rounded-md border border-gray-300 p-3 text-sm text-[#1B2A41] focus:border-[#E8710A] focus:outline-none focus:ring-1 focus:ring-[#E8710A]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleSummarize}
            disabled={loading || transcript.trim().length === 0}
            className="w-full rounded-md bg-[#1B2A41] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#13202f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Thinking..." : "Summarize"}
          </button>

          <div className="flex items-center gap-2">
            <label
              htmlFor="tone"
              className="text-sm font-medium text-[#1B2A41]"
            >
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1B2A41] focus:border-[#E8710A] focus:outline-none focus:ring-1 focus:ring-[#E8710A] sm:flex-none"
            >
              <option value="Formal">Formal</option>
              <option value="Friendly">Friendly</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Results result={result} />

        {result && (
          <button
            type="button"
            onClick={handleDraftFollowup}
            disabled={followupLoading}
            className="w-full rounded-md bg-[#E8710A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c95f08] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start"
          >
            {followupLoading
              ? "Drafting..."
              : followup && tone !== followupTone
                ? "Regenerate email"
                : "Draft follow-up email"}
          </button>
        )}

        {followupError && <p className="text-sm text-red-600">{followupError}</p>}

        {followup && (
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold text-[#1B2A41]">
                {followup.subject}
              </h2>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-md border border-[#1B2A41] px-3 py-1.5 text-xs font-semibold text-[#1B2A41] transition-colors hover:bg-[#1B2A41] hover:text-white"
              >
                {copyLabel}
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
              {followup.body}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
