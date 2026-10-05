"use client";

// Formats in the viewer's own time zone. The server render may use a
// different zone, so the first paint can differ briefly before hydration.
export default function LocalDate({ iso }: { iso: string }) {
  const date = new Date(iso);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}
    </time>
  );
}
