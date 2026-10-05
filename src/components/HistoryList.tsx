import type { ActionItem } from "@/components/Results";
import LocalDate from "@/components/LocalDate";

export type HistoryItem = {
  id: string;
  created_at: string;
  tone: string | null;
  summary: string | null;
  key_decisions: unknown;
  action_items: unknown;
};

function asStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function asActionItems(value: unknown): ActionItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => v && typeof v === "object")
    .map((v) => ({
      owner: typeof v.owner === "string" ? v.owner : "",
      task: typeof v.task === "string" ? v.task : "",
      due: typeof v.due === "string" ? v.due : "",
    }));
}

export default function HistoryList({
  items,
  loadFailed = false,
}: {
  items: HistoryItem[];
  loadFailed?: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-[#1B2A41]">History</h2>

      {loadFailed ? (
        <p className="text-sm text-red-600">
          We couldn&apos;t load your history. Refresh the page to try again.
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-600">
          No summaries yet. Paste a transcript above to make your first one.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const summary = item.summary ?? "";
            const firstLine = summary.split("\n")[0];
            const decisions = asStrings(item.key_decisions);
            const actions = asActionItems(item.action_items);

            return (
              <li key={item.id}>
                <details className="group rounded-lg border border-gray-200 bg-white shadow-sm">
                  <summary className="flex cursor-pointer list-none flex-col gap-1 p-4 [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <LocalDate iso={item.created_at} />
                        {item.tone && (
                          <span className="rounded-full bg-[#E8710A]/10 px-2 py-0.5 font-medium text-[#E8710A]">
                            {item.tone}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-[#E8710A]">
                        <span className="group-open:hidden">Expand</span>
                        <span className="hidden group-open:inline">
                          Collapse
                        </span>
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-[#1B2A41] group-open:hidden">
                      {firstLine || "(No summary text)"}
                    </p>
                  </summary>

                  <div className="flex flex-col gap-4 border-t border-gray-200 p-4">
                    <div>
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#1B2A41]">
                        Executive Summary
                      </h3>
                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {summary || "Nothing recorded."}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#1B2A41]">
                        Key Decisions
                      </h3>
                      {decisions.length === 0 ? (
                        <p className="text-sm text-gray-600">None recorded.</p>
                      ) : (
                        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                          {decisions.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#1B2A41]">
                        Action Items
                      </h3>
                      {actions.length === 0 ? (
                        <p className="text-sm text-gray-600">None recorded.</p>
                      ) : (
                        <ul className="space-y-2 text-sm text-gray-700">
                          {actions.map((a, i) => (
                            <li key={i} className="rounded-md bg-[#F4F5F7] p-2">
                              <p>{a.task || "(No task)"}</p>
                              <p className="text-xs text-gray-600">
                                {a.owner || "No owner"} · Due{" "}
                                {a.due || "none"}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
