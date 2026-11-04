import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  size = "md",
  href = "/",
  light,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string | null;
  light?: boolean;
}) {
  const sizes = {
    sm: "text-[1.05rem] tracking-[0.34em]",
    md: "text-[1.28rem] tracking-[0.38em]",
    lg: "text-[2rem] tracking-[0.42em]",
  };

  const content = (
    <span className={cn("group inline-flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-display font-semibold uppercase leading-none",
          sizes[size],
          light ? "text-ink" : "text-cream",
        )}
        style={{ paddingRight: "0.06em" }}
      >
        Untouch
      </span>
      <span
        aria-hidden
        className={cn(
          "mb-[0.18em] inline-block size-1.5 shrink-0 rounded-full bg-ember transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-150",
        )}
      />
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="UNTOUCH — home" className="inline-flex">
      {content}
    </Link>
  );
}

export function Seal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("size-20", className)}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
    >
      <circle cx="60" cy="60" r="58" opacity="0.28" />
      <circle cx="60" cy="60" r="44" opacity="0.16" />
      <path d="M60 28c9 12 15 19 15 29a15 15 0 1 1-30 0c0-10 6-17 15-29Z" opacity="0.6" />
      <path d="M60 52c3.6 5 5.6 8 5.6 12a5.6 5.6 0 1 1-11.2 0c0-4 2-7 5.6-12Z" opacity="0.35" />
      <path id="sealPath" d="M60 60 m-33 0 a33 33 0 1 1 66 0 a33 33 0 1 1 -66 0" opacity="0" />
      <text
        fontSize="8.4"
        letterSpacing="3.1"
        fill="currentColor"
        stroke="none"
        opacity="0.5"
        fontFamily="var(--font-mono)"
      >
        <textPath href="#sealPath" startOffset="6%">
          SLOW FIRE · KARACHI · EST. 2016 ·
        </textPath>
      </text>
    </svg>
  );
}
