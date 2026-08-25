"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

type Variant = "up" | "left" | "right" | "scale" | "rise-lg";

const variantAttr: Record<Variant, string | undefined> = {
  up: undefined,
  left: "left",
  right: "right",
  scale: "scale",
  "rise-lg": "rise-lg",
};

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: {
  children?: ReactNode;
  variant?: Variant;
  delay?: number;
  as?: "div" | "span";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.revealed = "true";
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const revealStyle = {
    ...style,
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  if (Tag === "span") {
    return (
      <span
        ref={ref as RefObject<HTMLSpanElement>}
        data-reveal={variantAttr[variant] ?? true}
        className={className}
        style={revealStyle}
      >
        {children}
      </span>
    );
  }

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      data-reveal={variantAttr[variant] ?? true}
      className={className}
      style={revealStyle}
    >
      {children}
    </div>
  );
}
