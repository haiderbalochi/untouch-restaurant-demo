import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EyebrowHero({
  eyebrow,
  title,
  description,
  meta,
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  meta?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-cream/8 bg-ink pb-14 pt-20 md:pb-20 md:pt-28", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 size-[520px] rounded-full bg-ember/10 blur-[130px]"
      />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow flex items-center gap-3 text-ember-2">
              <span className="inline-block h-px w-8 bg-current" />
              {eyebrow}
            </p>
            <h1 className="text-editorial mt-6 text-[clamp(2.8rem,6vw,5rem)] text-cream">{title}</h1>
            {description ? (
              <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-cream/45">{description}</p>
            ) : null}
          </div>
          {meta ? (
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cream/30 md:pb-3">
              {meta}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
