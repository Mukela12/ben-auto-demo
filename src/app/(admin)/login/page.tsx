"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EtherealBackground } from "@/components/car-rental/ethereal-bg";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unconfigured, setUnconfigured] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUnconfigured(params.get("error") === "unconfigured");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-dark px-4">
      <EtherealBackground color="rgba(255, 95, 0, 0.45)" scale={35} speed={75} />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center">
            <Image src="/brand/ben-auto-logo.png" alt="Ben Auto" width={160} height={54} className="h-14 w-auto" />
          </Link>
          <p className="mt-2 text-sm text-white/50">Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-xl bg-card p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-foreground">Sign In</h2>
          <p className="mt-1 text-xs text-muted-foreground">Access the booking management dashboard</p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}
          {unconfigured && (
            <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              Admin auth is not configured yet. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_AUTH_SECRET`.
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-[#ff5f00] focus:ring-2 focus:ring-[#ff5f00]/20"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5f00] py-3 text-sm font-bold text-white transition-all hover:bg-[#ff5f00]/90 disabled:opacity-50"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          <Link href="/" className="hover:text-white/60">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
