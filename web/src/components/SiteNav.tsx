"use client";

import { useEffect, useRef, useState } from "react";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const SHOW_TOP = 90;
    const DELTA = 6;
    const onScroll = () => {
      const y = window.scrollY;
      const d = y - lastY.current;
      setScrolled(y > 40);
      if (y <= SHOW_TOP) setHidden(false);
      else if (d > DELTA) setHidden(true);
      else if (d < -DELTA) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`nav${hidden ? " is-hidden" : ""}${scrolled ? " is-scrolled" : ""}`}
      aria-label="Primary"
    >
      <div className="container">
        <div className="nav-inner">
          <a className="brand" href="#top">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path
                  d="M2.5 12.5 L6.5 5.5 L9 9.5 L11 6.5 L13.5 12.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Molehill<span className="dot">.</span>
          </a>
          <div className="nav-links">
            <a href="#method">How it works</a>
            <a href="#app">In the app</a>
            <a href="#spaces">Where it helps</a>
            <a href="#principles">Principles</a>
          </div>
          <a className="nav-cta" href="#waitlist">
            Join the waitlist
          </a>
        </div>
      </div>
    </nav>
  );
}
