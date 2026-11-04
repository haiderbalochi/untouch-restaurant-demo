"use client";

import type { ReactNode } from "react";
import { openCookieSettings } from "@/lib/consent";

export function CookieSettingsButton({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      {children ?? "Cookie settings"}
    </button>
  );
}
