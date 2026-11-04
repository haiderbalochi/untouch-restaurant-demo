"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const silk = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  as = "div",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: ElementType;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const Component = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <Component
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: silk }}
    >
      {children}
    </Component>
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: silk } },
};

export function StaggerGroup({
  children,
  className,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/** Editorial word-by-word reveal for hero headlines. */
export function TextReveal({
  text,
  className,
  delay = 0,
  as = "h1",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const Tag = as;
  const words = text.split(" ");
  if (reduce) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={cn("inline-block", className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 1, delay: delay + index * 0.055, ease: silk }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function Parallax({
  children,
  distance = 70,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const smooth = useSpring(y, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={reduce ? undefined : { y: smooth }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

export function Magnetic({
  children,
  strength = 16,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reduce = useReducedMotion();
  const springX = useSpring(x, { stiffness: 250, damping: 18 });
  const springY = useSpring(y, { stiffness: 250, damping: 18 });

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={reduce ? undefined : { x: springX, y: springY }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType === "touch") return;
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * strength * 2);
        y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * strength * 2);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-ember via-ember-2 to-saffron"
    />
  );
}

/** Soft light that follows the pointer on large screens only. */
export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const x = useSpring(glowX, { stiffness: 60, damping: 20, mass: 0.6 });
  const y = useSpring(glowY, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!media.matches || reduced.matches) return;
    setEnabled(true);
    const onMove = (event: PointerEvent) => {
      glowX.set(event.clientX - 260);
      glowY.set(event.clientY - 260);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [glowX, glowY]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 hidden size-[520px] rounded-full opacity-45 blur-[100px] lg:block"
      style={{
        x,
        y,
        background:
          "radial-gradient(circle, rgba(196,85,31,0.32) 0%, rgba(226,178,93,0.12) 45%, transparent 70%)",
      }}
    />
  );
}

export function Marquee({
  items,
  className,
  speed = 42,
}: {
  items: ReactNode[];
  className?: string;
  speed?: number;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div
        className="flex min-w-max animate-[marquee_var(--speed)_linear_infinite] items-center gap-10 pr-10 group-hover:[animation-play-state:paused]"
        style={{ "--speed": `${speed}s` } as React.CSSProperties}
      >
        {[...items, ...items].map((item, index) => (
          <span key={index} className="inline-flex items-center gap-10">
            {item}
            <span className="size-1 rounded-full bg-ember/60" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
