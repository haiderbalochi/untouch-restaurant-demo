"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { SITE } from "@/lib/site";

export function AdminLogin({ next }: { next: string }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Could not sign in. Please try again.");
        setPassword("");
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(60rem 40rem at 18% -10%, rgba(200,85,36,0.20), transparent 60%), radial-gradient(40rem 30rem at 95% 110%, rgba(214,171,108,0.12), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(244,237,227,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,237,227,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(70% 60% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[26rem]"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <Wordmark size="sm" href="/" />
          <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.28em] text-cream/30">
            Command room · restricted
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[1.6rem] border border-cream/10 bg-ink-2/70 p-7 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent"
          />

          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-ember/25 bg-ember/10 text-ember-3">
              <LockKeyhole className="size-4" />
            </span>
            <div>
              <h1 className="font-display text-[1.55rem] leading-tight text-cream">Welcome back.</h1>
              <p className="mt-0.5 text-[0.76rem] text-cream/40">UNTOUCH kitchen operations.</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-password"
                className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-cream/40"
              >
                Admin password
              </label>
              <div className="relative mt-2">
                <input
                  id="admin-password"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "admin-password-error" : undefined}
                  className="h-12 w-full rounded-xl border border-cream/12 bg-ink/70 px-4 pr-12 text-[0.95rem] text-cream outline-none transition-colors placeholder:text-cream/20 focus:border-ember/50 focus:ring-1 focus:ring-ember/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setVisible((value) => !value)}
                  aria-label={visible ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-cream/35 transition-colors hover:text-cream"
                >
                  {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div aria-live="polite" className="min-h-[1.1rem]">
              {error ? (
                <p id="admin-password-error" className="text-[0.76rem] text-red-300/90">
                  {error}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading || password.length === 0}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cream text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-all hover:bg-cream/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
              ) : (
                <>
                  Enter dashboard
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 border-t border-cream/8 pt-5 text-[0.68rem] leading-relaxed text-cream/30">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-cream/25" />
            <p>
              Password checked on the server. Sessions are signed, HttpOnly and expire after 8 hours.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-cream/35 transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-3" /> Back to {SITE.name}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
