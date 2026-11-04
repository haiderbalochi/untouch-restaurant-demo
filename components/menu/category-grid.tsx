"use client";

import { SetupNotice } from "@/components/layout/setup-notice";
import { EmptyState } from "@/components/ui/primitives";

/** Fallback surfaced when Realtime Database has no categories yet (or is unconfigured). */
export function UseCategoriesGrid() {
  return (
    <div className="space-y-6">
      <SetupNotice />
      <EmptyState
        title="No categories published yet."
        description="Once an administrator adds categories in the dashboard they appear here instantly."
      />
    </div>
  );
}
