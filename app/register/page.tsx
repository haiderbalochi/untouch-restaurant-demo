import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your UNTOUCH account for fast checkout, saved addresses and live order tracking.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="First time"
      title="Create your account."
      subtitle="One account for ordering, tracking and keeping your favourite plates close."
    >
      <Suspense fallback={<div className="h-96" />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
