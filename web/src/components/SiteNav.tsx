"use client";

import Image from "next/image";
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
          <a
            className="brand"
            href="#top"
            aria-label="UNBIG home"
            aria-describedby="brand-definition"
          >
            <span className="brand-mark" aria-hidden="true">
              <Image
                src="/images/mascots/inchworm-measuring-tape-site-palette.png"
                alt=""
                width={48}
                height={48}
                priority
              />
            </span>
            <span className="brand-lockup">
              <span className="brand-name">
                UNBIG<span className="dot">.</span>
              </span>
              <span className="brand-definition" id="brand-definition">
                <span>verb</span> to make a big thing small enough to start
              </span>
            </span>
          </a>
          <div className="nav-links">
            <a href="#method">How it works</a>
            <a href="#app">In the app</a>
            <a href="#spaces">Where it helps</a>
            <a href="#principles">Principles</a>
          </div>
          <a className="nav-cta" href="#waitlist" aria-label="Join the waitlist">
            <span className="nav-cta-full">Join the waitlist</span>
            <span className="nav-cta-short" aria-hidden="true">Join</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
