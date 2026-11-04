import Link from "next/link";
import { ButtonLink } from "@/components/ui/primitives";
import { Wordmark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <Wordmark size="sm" href="/" />
      <p className="mt-10 font-mono text-[0.66rem] uppercase tracking-[0.24em] text-ember-2">
        404 · off the menu
      </p>
      <h1 className="text-editorial mt-5 max-w-2xl text-[clamp(2.6rem,7vw,5rem)] text-cream">
        This plate was never here.
      </h1>
      <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-cream/45">
        The page you asked for has left the pass. The kitchen, however, is very much open.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/menu" size="md">
          Explore the menu
        </ButtonLink>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-cream/20 px-6 text-[0.74rem] uppercase tracking-[0.16em] text-cream/70 transition-colors hover:bg-cream/6"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
