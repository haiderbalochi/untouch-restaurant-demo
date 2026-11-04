import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your UNTOUCH account to order, track deliveries and save favourites.",
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to UNTOUCH."
      subtitle="Your cart, addresses and order history are waiting exactly where you left them."
    >
      <Suspense fallback={<div className="h-72" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
