"use client";

import { useEffect } from "react";
import { useDemoModeStore } from "@/lib/demo/mode";
import { DEMO_STORAGE_KEY, hydrateDemoStore } from "@/lib/demo/store";

/**
 * Boots the browser-local demo data and shares the server's demo verdict with
 * every client surface (storefront and admin).
 */
export function DemoProvider({ demo, children }: { demo: boolean; children: React.ReactNode }) {
  useEffect(() => {
    useDemoModeStore.getState().setServerDemo(demo);
  }, [demo]);

  useEffect(() => {
    hydrateDemoStore();

    // Keep demo edits in sync if the dashboard is open in another tab.
    const onStorage = (event: StorageEvent) => {
      if (event.key === DEMO_STORAGE_KEY) hydrateDemoStore();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <>{children}</>;
}
