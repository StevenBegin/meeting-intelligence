import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 justify-center bg-white px-4 py-16 sm:px-6 sm:py-24">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold text-[#1B2A41] sm:text-4xl">
          Meeting <span className="text-[#E8710A]">Intelligence</span>
        </h1>
        <p className="max-w-md text-base text-gray-600">
          Paste a meeting transcript and get a summary, key decisions, action
          items, and a ready-to-send follow-up email.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-md bg-[#1B2A41] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#13202f] sm:w-auto"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="w-full rounded-md bg-[#E8710A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c95f08] sm:w-auto"
          >
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
