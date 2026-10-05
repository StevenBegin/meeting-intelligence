import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold text-[#1B2A41]"
        >
          Meeting <span className="text-[#E8710A]">Intelligence</span>
        </Link>

        {email ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="max-w-[40vw] truncate text-sm text-gray-600 sm:max-w-xs">
              {email}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold text-[#E8710A] hover:underline"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
