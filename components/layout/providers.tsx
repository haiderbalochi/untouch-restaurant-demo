"use client";

import { AuthProvider } from "@/lib/auth-context";
import { CartSync } from "@/components/cart/cart-sync";
import { DemoProvider } from "@/components/demo/demo-provider";
import { InstallProvider } from "@/components/pwa/install-context";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function Providers({ children, demo }: { children: ReactNode; demo: boolean }) {
  return (
    <DemoProvider demo={demo}>
      <AuthProvider>
        <InstallProvider>
          <CartSync />
          {children}
          <Toaster
            position="bottom-center"
            theme="dark"
            toastOptions={{
              style: {
                background: "#171412",
                border: "1px solid rgba(242,236,225,0.12)",
                color: "#f2ece1",
                borderRadius: "16px",
                fontSize: "0.875rem",
              },
            }}
          />
        </InstallProvider>
      </AuthProvider>
    </DemoProvider>
  );
}
