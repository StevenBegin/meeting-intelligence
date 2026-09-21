export type ActionItem = {
  owner: string;
  task: string;
  due: string;
};

export type SummaryResult = {
  summary: string;
  key_decisions: string[];
  action_items: ActionItem[];
};

const EMPTY_MESSAGE = "The AI did not find anything for this section.";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-[#F4F5F7] p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#1B2A41]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Results({ result }: { result: SummaryResult | null }) {
  if (!result) {
    return (
      <div className="flex flex-col gap-4">
        <SectionCard title="Executive Summary">
          <p className="text-sm text-gray-600">Nothing yet.</p>
        </SectionCard>
        <SectionCard title="Key Decisions">
          <p className="text-sm text-gray-600">Nothing yet.</p>
        </SectionCard>
        <SectionCard title="Action Items">
          <p className="text-sm text-gray-600">Nothing yet.</p>
        </SectionCard>
      </div>
    );
  }

  const hasSummary = result.summary && result.summary.trim().length > 0;
  const hasDecisions = result.key_decisions && result.key_decisions.length > 0;
  const hasActionItems = result.action_items && result.action_items.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Executive Summary">
        {hasSummary ? (
          <p className="text-sm text-gray-700">{result.summary}</p>
        ) : (
          <p className="text-sm text-gray-600">{EMPTY_MESSAGE}</p>
        )}
      </SectionCard>

      <SectionCard title="Key Decisions">
        {hasDecisions ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {result.key_decisions.map((decision, index) => (
              <li key={index}>{decision}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">{EMPTY_MESSAGE}</p>
        )}
      </SectionCard>

      <SectionCard title="Action Items">
        {hasActionItems ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#1B2A41] text-white">
                  <th className="px-3 py-2 font-semibold">Owner</th>
                  <th className="px-3 py-2 font-semibold">Task</th>
                  <th className="px-3 py-2 font-semibold">Due</th>
                </tr>
              </thead>
              <tbody>
                {result.action_items.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#F4F5F7]"}
                  >
                    <td className="px-3 py-2 text-gray-700">
                      {item.owner || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {item.task || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {item.due || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600">{EMPTY_MESSAGE}</p>
        )}
      </SectionCard>
    </div>
  );
}
