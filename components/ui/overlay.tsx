"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const silk = [0.22, 1, 0.36, 1] as const;

function useLockScroll(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useLockScroll(open);
  useEscape(open, onClose);
  const reduce = useReducedMotion();
  const width = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.button
            aria-label="Close dialog"
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.99 }}
            transition={{ duration: 0.45, ease: silk }}
            className={cn(
              "relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-cream/12 bg-ink-2 p-6 shadow-deep sm:rounded-3xl sm:p-8",
              width,
            )}
          >
            <div className="mb-6 flex items-start justify-between gap-6">
              <div>
                {title ? (
                  <h3 className="font-display text-2xl text-cream">{title}</h3>
                ) : null}
                {description ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-cream/45">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-cream/15 p-2 text-cream/50 transition-colors hover:text-cream"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            {children}
            {footer ? <div className="mt-7">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  widthClass = "w-full sm:max-w-[460px]",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "left";
  widthClass?: string;
}) {
  useLockScroll(open);
  useEscape(open, onClose);
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[95]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "Panel"}
        >
          <motion.button
            aria-label="Close panel"
            className="absolute inset-0 bg-ink/75 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: side === "right" ? "100%" : "-100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: side === "right" ? "100%" : "-100%" }}
            transition={{ duration: 0.55, ease: silk }}
            className={cn(
              "absolute bottom-0 flex h-full flex-col border-cream/12 bg-ink-2 shadow-deep",
              side === "right" ? "right-0 border-l" : "left-0 border-r",
              widthClass,
            )}
          >
            <header className="flex items-center justify-between border-b border-cream/10 px-5 py-5 sm:px-7">
              <div>
                <p className="eyebrow text-cream/40">UNTOUCH</p>
                {title ? <h3 className="mt-1 font-display text-xl text-cream">{title}</h3> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-cream/15 p-2 text-cream/60 transition-colors hover:text-cream"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">{children}</div>
            {footer ? (
              <footer className="border-t border-cream/10 bg-ink/40 px-5 py-5 sm:px-7">{footer}</footer>
            ) : null}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
