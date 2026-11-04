"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dimension = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-cream/15 bg-cream/[0.04]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          "grid place-items-center rounded-full text-cream/60 transition-colors hover:text-cream disabled:opacity-30",
          dimension,
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn(
          "min-w-7 text-center font-mono text-[0.8rem] tabular-nums text-cream",
          size === "sm" && "text-[0.72rem]",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          "grid place-items-center rounded-full text-cream/60 transition-colors hover:text-cream disabled:opacity-30",
          dimension,
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
