"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { GoogleGlyph } from "@/components/auth/google-glyph";
import { Button, Divider, Field, Input } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { authErrorMessage } from "@/lib/auth-errors";

function useNextHref() {
  const params = useSearchParams();
  const next = params.get("next");
  return next && next.startsWith("/") ? next : "/account";
}

function GoogleButton({ busy, onDone }: { busy: boolean; onDone: () => void }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      className="w-full"
      loading={busy || loading}
      onClick={async () => {
        setLoading(true);
        try {
          await signInWithGoogle();
          onDone();
        } catch (error) {
          toast.error(authErrorMessage(error));
        } finally {
          setLoading(false);
        }
      }}
    >
      <GoogleGlyph className="size-4" /> Continue with Google
    </Button>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder ?? "••••••••"}
        className="pr-11"
        required
        minLength={8}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-cream/35 transition-colors hover:text-cream"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const next = useNextHref();
  const { signIn, user, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Firebase is not configured yet. Add your web config to .env.local.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      toast.success("Welcome back to UNTOUCH.");
      router.replace(next);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <GoogleButton busy={busy} onDone={() => router.replace(next)} />
      <Divider label="or with email" />

      <Field label="Email" htmlFor="login-email">
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </Field>
      <Field
        label="Password"
        htmlFor="login-password"
        error={error ?? undefined}
      >
        <PasswordInput
          id="login-password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
      </Field>

      <div className="flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-[0.7rem] uppercase tracking-[0.14em] text-cream/40 transition-colors hover:text-cream"
        >
          Forgot password?
        </Link>
        <span className="flex items-center gap-1.5 text-[0.66rem] text-cream/25">
          <ShieldCheck className="size-3" /> Secured by Firebase
        </span>
      </div>

      <Button type="submit" size="md" className="w-full" loading={busy}>
        Sign in
      </Button>

      <p className="text-center text-[0.78rem] text-cream/40">
        New here?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-ember-3 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const next = useNextHref();
  const { signUp, user, configured } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!configured) {
      setError("Firebase is not configured yet. Add your web config to .env.local.");
      return;
    }
    if (form.fullName.trim().length < 2) {
      setError("Please tell us your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("That email address doesn't look right.");
      return;
    }
    if (form.password.length < 8) {
      setError("Passwords need at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
      });
      toast.success("Account created — welcome to UNTOUCH.");
      router.replace(next);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <GoogleButton busy={busy} onDone={() => router.replace(next)} />
      <Divider label="or with email" />

      <Field label="Full name" htmlFor="register-name">
        <Input
          id="register-name"
          value={form.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          autoComplete="name"
          placeholder="Your name"
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="register-email">
          <Input
            id="register-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Phone" htmlFor="register-phone" hint="Optional">
          <Input
            id="register-phone"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+92 3xx xxx xxxx"
          />
        </Field>
      </div>
      <Field label="Password" htmlFor="register-password" hint="Minimum 8 characters.">
        <PasswordInput
          id="register-password"
          value={form.password}
          onChange={(value) => update("password", value)}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Confirm password" htmlFor="register-confirm" error={error ?? undefined}>
        <PasswordInput
          id="register-confirm"
          value={form.confirm}
          onChange={(value) => update("confirm", value)}
          autoComplete="new-password"
        />
      </Field>

      <Button type="submit" size="md" className="w-full" loading={busy}>
        Create account
      </Button>

      <p className="text-center text-[0.78rem] text-cream/40">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-ember-3 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!configured) {
      setError("Firebase is not configured yet. Add your web config to .env.local.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-cream/12 bg-cream/[0.03] p-6 text-center">
        <Mail className="mx-auto size-6 text-ember-3" />
        <p className="mt-4 font-display text-xl text-cream">Check your inbox.</p>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-cream/45">
          We sent a password reset link to <span className="text-cream/75">{email}</span>. It may take
          a minute to arrive.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex text-[0.72rem] uppercase tracking-[0.16em] text-ember-3 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email" htmlFor="forgot-email" error={error ?? undefined}>
        <Input
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </Field>
      <Button type="submit" size="md" className="w-full" loading={busy}>
        Send reset link
      </Button>
      <p className="text-center text-[0.78rem] text-cream/40">
        Remembered it?{" "}
        <Link href="/login" className="text-ember-3 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
