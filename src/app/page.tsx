"use client";

import { useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
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
            className="w-full resize-y rounded-md border border-gray-300 p-3 text-sm text-[#1B2A41] focus:border-[#E8710A] focus:outline-none focus:ring-1 focus:ring-[#E8710A]"
          />
        </div>

        <button
          type="button"
          onClick={handleSummarize}
          disabled={loading || transcript.trim().length === 0}
          className="w-full rounded-md bg-[#1B2A41] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#13202f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start"
        >
          {loading ? "Thinking..." : "Summarize"}
        </button>

        <div className="flex flex-col gap-4">
          <section className="rounded-lg bg-[#F4F5F7] p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#1B2A41]">
              Executive Summary
            </h2>
            <p className="text-sm text-gray-600">Nothing yet.</p>
          </section>

          <section className="rounded-lg bg-[#F4F5F7] p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#1B2A41]">
              Key Decisions
            </h2>
            <p className="text-sm text-gray-600">Nothing yet.</p>
          </section>

          <section className="rounded-lg bg-[#F4F5F7] p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#1B2A41]">
              Action Items
            </h2>
            <p className="text-sm text-gray-600">Nothing yet.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
