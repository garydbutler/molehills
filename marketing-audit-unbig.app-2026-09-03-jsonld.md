# Ready-to-paste JSON-LD for unbig.app (fixes #4 and #5)

Add inside the `<body>` of `web/src/app/layout.tsx` (or as a component rendered on the homepage). Next.js pattern — a plain `<script type="application/ld+json">` with `dangerouslySetInnerHTML` is fine and SSR-safe.

Fill every `[NEED: …]` with a real value before shipping. Do not ship placeholders — an FAQ answer that's wrong is worse than no FAQ.

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          name: "Unbig",
          applicationCategory: "ProductivityApplication",
          operatingSystem: "iOS, Android",
          url: "https://unbig.app",
          description:
            "An ADHD-friendly app that turns a photo — or one sentence — about a task too big to start into a plan of small steps, handing you three a day and never a fourth. No streaks, timers, or guilt.",
          offers: {
            "@type": "Offer",
            // [NEED: confirm the real model before publishing a price]
            price: "0",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Is Unbig free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "[NEED: real answer — e.g. 'Unbig is free to start.']",
              },
            },
            {
              "@type": "Question",
              name: "When does Unbig launch?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Unbig is in development. Join the waitlist and we'll email you once — the day it's ready to try. [NEED: window if you have one]",
              },
            },
            {
              "@type": "Question",
              name: "Does Unbig diagnose or treat ADHD?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. Unbig is a task companion built to be friendly to ADHD minds. It does not diagnose, treat, or claim any clinical effect.",
              },
            },
            {
              "@type": "Question",
              name: "Do you see my photos?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The photo is only the starting point for your plan, and for work that's nobody's business you can skip the camera entirely — one sentence gets the same plan. [NEED: one line on storage/retention to match your privacy policy]",
              },
            },
          ],
        },
      ],
    }),
  }}
/>
```

**Note:** `FAQPage` rich results only earn a snippet when the same Q&A is visible on the page. Ship the FAQ section (fix #5) alongside this, not the schema alone.
