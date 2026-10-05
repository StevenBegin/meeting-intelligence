import { redirect } from "next/navigation";
import Summarizer from "@/components/Summarizer";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 justify-center bg-white px-4 py-10 sm:px-6">
      <main className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#1B2A41] sm:text-3xl">
            Meeting Intelligence
          </h1>
          <p className="break-all text-sm text-gray-600">
            Signed in as{" "}
            <span className="font-medium text-[#1B2A41]">{user.email}</span>
          </p>
        </div>

        <Summarizer />
      </main>
    </div>
  );
}
