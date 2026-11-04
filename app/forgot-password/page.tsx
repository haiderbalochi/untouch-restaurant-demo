import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset the password for your UNTOUCH account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title="Let's get you back in."
      subtitle="Enter the email tied to your account and we'll send a secure reset link."
    >
      <Suspense fallback={<div className="h-56" />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
