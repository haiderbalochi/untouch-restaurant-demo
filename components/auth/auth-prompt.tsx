"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/overlay";
import { Button, Divider } from "@/components/ui/primitives";
import { GoogleGlyph } from "@/components/auth/google-glyph";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { authErrorMessage } from "@/lib/auth-errors";

/**
 * Guests can browse freely, but adding to the cart requires an account.
 * The intended line is preserved in the cart store and applied after sign-in.
 */
export function AuthPrompt() {
  const { promptOpen, setPromptOpen, pendingLine, addRaw, takePending, openDrawer } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const next = encodeURIComponent(pathname || "/");

  useEffect(() => {
    if (!user || !pendingLine) return;
    addRaw(pendingLine);
    takePending();
    setPromptOpen(false);
    openDrawer();
    toast.success(`${pendingLine.name} added to your cart`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingLine]);

  return (
    <Modal
      open={promptOpen}
      onClose={() => setPromptOpen(false)}
      title="A table for one? An account first."
      description={
        pendingLine
          ? `Sign in to add ${pendingLine.name} to your cart — we'll keep your selection ready.`
          : "Sign in to start building your order."
      }
      size="sm"
      footer={
        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            size="md"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await signInWithGoogle();
              } catch (error) {
                toast.error(authErrorMessage(error));
              } finally {
                setBusy(false);
              }
            }}
          >
            <GoogleGlyph className="size-4" /> Continue with Google
          </Button>
          <Divider label="or" />
          <div className="grid gap-2">
            <ButtonLinkStyled href={`/login?next=${next}`}>Sign in</ButtonLinkStyled>
            <ButtonLinkStyled href={`/register?next=${next}`} variant="outline">
              Create account
            </ButtonLinkStyled>
          </div>
        </div>
      }
    >
      <ul className="space-y-3 text-sm text-cream/55">
        {[
          "Track every order in real time",
          "Save addresses for one-tap checkout",
          "Reorder your favourites instantly",
        ].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <ShieldCheck className="size-4 text-ember-3/80" />
            {item}
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function ButtonLinkStyled({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "flex h-11 items-center justify-center rounded-full bg-ember text-[0.74rem] uppercase tracking-[0.16em] text-cream transition-colors hover:bg-ember-2"
          : "flex h-11 items-center justify-center rounded-full border border-cream/20 text-[0.74rem] uppercase tracking-[0.16em] text-cream transition-colors hover:bg-cream/6"
      }
    >
      {children}
    </Link>
  );
}
