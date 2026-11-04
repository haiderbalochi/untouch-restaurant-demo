"use client";

import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Buttons ─────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "dark" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ember text-cream hover:bg-ember-2 shadow-[0_18px_40px_-24px_rgba(196,85,31,0.9)]",
  secondary: "bg-cream text-ink hover:bg-cream-2",
  ghost: "bg-transparent text-cream/80 hover:bg-cream/8 hover:text-cream",
  outline:
    "border border-cream/22 bg-transparent text-cream hover:border-cream/45 hover:bg-cream/6",
  dark: "bg-ink text-cream hover:bg-ink-3 border border-cream/12",
  danger: "bg-red-500/15 text-red-200 border border-red-400/30 hover:bg-red-500/25",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.72rem] tracking-[0.14em]",
  md: "h-11 px-6 text-[0.74rem] tracking-[0.16em]",
  lg: "h-14 px-8 text-[0.78rem] tracking-[0.18em]",
  icon: "h-11 w-11",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium uppercase transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-45",
        buttonStyles[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      <span className={cn("inline-flex items-center gap-2", loading && "opacity-70")}>{children}</span>
    </button>
  );
});

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium uppercase transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        buttonStyles[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

/* ─────────────────────────── Form controls ─────────────────────────── */

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("block space-y-2", className)}>
      {label ? (
        <span className="eyebrow block text-cream/45">{label}</span>
      ) : null}
      {children}
      {error ? (
        <span className="block text-xs text-red-300">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-cream/40">{hint}</span>
      ) : null}
    </label>
  );
}

const controlBase =
  "w-full rounded-xl border border-cream/14 bg-cream/[0.035] px-4 text-[0.94rem] text-cream placeholder:text-cream/30 transition-colors duration-200 hover:border-cream/25 focus:border-ember-2/70 focus:bg-cream/[0.06] focus:outline-none disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlBase, "h-12", className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(controlBase, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          controlBase,
          "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%23f2ece1%22 stroke-opacity=%22.5%22 stroke-width=%221.4%22 fill=%22none%22/></svg>')] bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat pr-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm text-cream/85">{label}</p>
        {description ? <p className="mt-0.5 text-xs text-cream/40">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-ember/50 bg-ember/80" : "border-cream/20 bg-cream/10",
          disabled && "opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4.5 rounded-full bg-cream transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            checked ? "translate-x-[1.35rem]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

/* ─────────────────────────── Display ─────────────────────────── */

type Tone = "neutral" | "warm" | "sage" | "danger" | "success" | "light";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-cream/8 text-cream/70 border-cream/15",
  warm: "bg-ember/15 text-ember-3 border-ember/30",
  sage: "bg-sage/15 text-[#bcc9a6] border-sage/35",
  danger: "bg-red-500/12 text-red-300 border-red-400/30",
  success: "bg-emerald-500/12 text-emerald-300 border-emerald-400/30",
  light: "bg-clay/10 text-clay border-clay/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em]",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    pending: { tone: "neutral", label: "Pending" },
    confirmed: { tone: "warm", label: "Confirmed" },
    preparing: { tone: "warm", label: "Preparing" },
    ready: { tone: "warm", label: "Ready" },
    out_for_delivery: { tone: "sage", label: "On the way" },
    delivered: { tone: "success", label: "Delivered" },
    cancelled: { tone: "danger", label: "Cancelled" },
    unpaid: { tone: "neutral", label: "Unpaid" },
    paid: { tone: "success", label: "Paid" },
    refunded: { tone: "sage", label: "Refunded" },
    failed: { tone: "danger", label: "Failed" },
    approved: { tone: "success", label: "Approved" },
    rejected: { tone: "danger", label: "Rejected" },
    active: { tone: "success", label: "Active" },
    inactive: { tone: "neutral", label: "Inactive" },
  };
  const entry = map[status] ?? { tone: "neutral" as Tone, label: status };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export function StarRating({
  value,
  size = 14,
  className,
  showValue,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          width={size}
          height={size}
          className={cn(
            index < Math.round(value) ? "fill-saffron text-saffron" : "fill-transparent text-cream/25",
          )}
          strokeWidth={1.4}
        />
      ))}
      {showValue ? <span className="ml-1 text-xs text-cream/50">{value.toFixed(1)}</span> : null}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-xl", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-cream/15 bg-cream/[0.02] px-6 py-16 text-center",
        className,
      )}
    >
      {icon ? <div className="mb-5 text-ember-3/80">{icon}</div> : null}
      <p className="font-display text-2xl text-cream/90">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/45">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-cream/60", className)} aria-hidden />;
}

export function Divider({ className, label }: { className?: string; label?: string }) {
  if (!label) return <div className={cn("hairline w-full", className)} />;
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="hairline flex-1" />
      <span className="eyebrow text-cream/35">{label}</span>
      <div className="hairline flex-1" />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  light,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow ? (
          <p className="eyebrow mb-5 flex items-center gap-3 text-ember-2">
            <span className="inline-block h-px w-8 bg-current" aria-hidden />
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-editorial text-[clamp(2.1rem,4.4vw,3.6rem)]",
            light ? "text-ink" : "text-cream",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-5 max-w-xl text-[0.95rem] leading-relaxed",
              align === "center" && "mx-auto",
              light ? "text-ink/60" : "text-cream/50",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
