export function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
      aria-hidden="true"
    />
  );
}

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-[#F4F5F7] p-4">
      <div className="h-4 w-full animate-pulse rounded bg-gray-300" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-300" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300" />
    </div>
  );
}

export function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg bg-[#F4F5F7] p-4">
      <p className="text-sm text-gray-700">
        Something went wrong talking to the AI. Try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-[#1B2A41] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#13202f]"
      >
        Retry
      </button>
    </div>
  );
}
