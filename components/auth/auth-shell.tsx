import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { IMAGERY } from "@/lib/imagery";
import { cdnImage } from "@/lib/utils";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100svh-108px)] lg:grid-cols-[1.05fr_1fr]">
      <div className="relative flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-cream/35 transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-3.5" /> Back to the restaurant
          </Link>

          <div className="mt-10">
            <Wordmark size="sm" href={null} />
            <p className="eyebrow mt-8 text-ember-2">{eyebrow}</p>
            <h1 className="text-editorial mt-4 text-[clamp(2.2rem,4vw,3rem)] text-cream">{title}</h1>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-cream/45">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-7">{footer}</div> : null}
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={cdnImage(IMAGERY.dough, 1400)}
          alt=""
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="absolute inset-x-10 bottom-12">
          <p className="font-display text-[2rem] leading-tight text-cream/90">
            “The wait is the recipe.”
          </p>
          <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-cream/35">
            UNTOUCH · kitchen notes
          </p>
        </div>
      </div>
    </div>
  );
}
