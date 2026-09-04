"use client";

import { useState } from "react";
import { SITE_URL as SHARE_URL } from "@/lib/site";
const SHARE_TEXT =
  "Make big things small enough to start — Unbig turns any task that feels too big into three small steps a day.";

// ponytail: plain share-intent URLs, no SDK. Facebook ignores custom text and
// pulls the OG tags from layout.tsx instead.
const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "X",
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`,
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    label: "Facebook",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
];

export default function ShareLinks() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    // ponytail: clipboard API covers every secure context; skip the execCommand
    // legacy fallback until someone actually needs it.
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(SHARE_URL)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="share-block">
      <p className="share-lead">Know someone who&apos;d get this? Send it their way.</p>
      <div className="share-row">
        <button
          type="button"
          className="share-link"
          onClick={copyLink}
          aria-label="Copy link"
          data-tooltip={copied ? "Copied" : "Copy link"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
            <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
          </svg>
        </button>
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            className="share-link"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${s.label}`}
            data-tooltip={`Share on ${s.label}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={s.path} />
            </svg>
          </a>
        ))}
      </div>
      <p className="share-status" aria-live="polite">
        {copied ? "Link copied" : ""}
      </p>
    </div>
  );
}
