"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

function friendlyError(error: AuthError, mode: Mode): string {
  const message = error.message.toLowerCase();

  if (error.code === "email_not_confirmed" || message.includes("not confirmed")) {
    return "Please confirm your email first. Check your inbox for the link we sent.";
  }
  if (error.code === "invalid_credentials" || message.includes("invalid login")) {
    return "That email and password don't match. Please try again.";
  }
  if (
    error.code === "user_already_exists" ||
    error.code === "email_exists" ||
    message.includes("already registered")
  ) {
    return "An account with that email already exists. Try logging in instead.";
  }
  if (error.code === "weak_password" || message.includes("at least 6")) {
    return "Your password must be at least 6 characters.";
  }
  if (error.code === "validation_failed" || message.includes("invalid format")) {
    return "Please enter a valid email address.";
  }
  if (error.status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return mode === "login"
    ? "We couldn't log you in. Please try again."
    : "We couldn't create your account. Please try again.";
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!isLogin && password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(friendlyError(error, mode));
      setLoading(false);
      return;
    }

    // With "Confirm email" on in Supabase, sign up succeeds but returns no
    // session until the user clicks the emailed link.
    if (!data.session) {
      setNotice(`Almost done! We sent a confirmation link to ${email}. Click it, then log in.`);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-1 justify-center bg-white px-4 py-10 sm:px-6">
      <main className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-2xl font-semibold text-[#1B2A41] sm:text-3xl">
          {isLogin ? "Log in" : "Sign up"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-[#1B2A41]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-[#1B2A41] focus:border-[#E8710A] focus:outline-none focus:ring-1 focus:ring-[#E8710A]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-[#1B2A41]">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-[#1B2A41] focus:border-[#E8710A] focus:outline-none focus:ring-1 focus:ring-[#E8710A]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-md bg-[#1B2A41] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#13202f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isLogin
                ? "Logging in…"
                : "Creating account…"
              : isLogin
                ? "Log in"
                : "Sign up"}
          </button>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {notice && (
            <p role="status" className="text-sm text-[#1B2A41]">
              {notice}
            </p>
          )}
        </form>

        <p className="text-sm text-gray-600">
          {isLogin ? "No account yet? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="font-medium text-[#E8710A] hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </main>
    </div>
  );
}
