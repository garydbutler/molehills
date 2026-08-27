import Reveal from "@/components/Reveal";
import SiteNav from "@/components/SiteNav";
import PhoneDemo from "@/components/PhoneDemo";
import BeforeAfter from "@/components/BeforeAfter";
import WaitlistForm from "@/components/WaitlistForm";

const methodSteps = [
  {
    no: "Step 01",
    tag: "Capture",
    title: "Snap the truth",
    body: "Photograph the cluttered room, the overgrown bed, the half-done project. Molehill reads the image and writes a 12-step plan — a title, a written vision, and small jobs split across days. Save it for later or start today.",
    glyph: (
      <svg viewBox="0 0 32 32">
        <rect x="4" y="9" width="24" height="17" rx="3" />
        <path d="M11 9l2-4h6l2 4" />
        <circle cx="16" cy="17.5" r="5" />
      </svg>
    ),
  },
  {
    no: "Step 02",
    tag: "Vision",
    title: "Read the destination",
    body: "The plan comes with a written vision — a sentence that describes what done looks like. If you want, you can ask for a rendered picture of that end state, but the plan works just as well without it.",
    glyph: (
      <svg viewBox="0 0 32 32">
        <path d="M3 16c3.5-5.5 7.8-8.5 13-8.5S25.5 10.5 29 16c-3.5 5.5-7.8 8.5-13 8.5S6.5 21.5 3 16Z" />
        <circle cx="16" cy="16" r="4" />
      </svg>
    ),
  },
  {
    no: "Step 03",
    tag: "Today",
    title: "Three steps, then rest",
    body: "The mountain is cut into steps of minutes, not weekends. Each day serves exactly three — never more. Finish them and you're done for today. Genuinely done.",
    glyph: (
      <svg viewBox="0 0 32 32">
        <path d="M5 9h22M5 16h15M5 23h8" />
      </svg>
    ),
  },
  {
    no: "Step 04",
    tag: "Journey",
    title: "Return when ready",
    body: "Projects wait in Journey until you pick them again. When you finish a day's steps, re-photograph the space — not a checkbox, just a second look. Before-and-after becomes proof you're actually moving.",
    glyph: (
      <svg viewBox="0 0 32 32">
        <path d="M16 27V13" />
        <path d="M16 19c-5 0-9-3.5-9-8 4.5 0 9 3.5 9 8Z" />
        <path d="M16 15c4.5 0 8-3 8-7-4 0-8 3-8 7Z" />
        <path d="M10 27h12" />
      </svg>
    ),
  },
];

const spaces = [
  {
    title: "Cluttered rooms",
    body: "The classic. Watch the living room become a place you want to sit in.",
    glyph: (
      <svg viewBox="0 0 26 26">
        <path d="M4 21v-8l9-6 9 6v8" />
        <path d="M4 21h18" />
        <path d="M10 21v-5h6v5" />
      </svg>
    ),
  },
  {
    title: "Desk resets",
    body: "Papers, cables, mystery piles — back to a surface that thinks clearly.",
    glyph: (
      <svg viewBox="0 0 26 26">
        <path d="M13 3v6" />
        <path d="M9 9h8l2 5H7Z" />
        <path d="M13 14v6M8 23h10" />
      </svg>
    ),
  },
  {
    title: "Gardens & yards",
    body: "From jungle to sanctuary, one handful of leaves per visit.",
    glyph: (
      <svg viewBox="0 0 26 26">
        <path d="M13 22V10" />
        <path d="M13 14c-4 0-7-2.6-7-6.5C9.5 7.5 13 10 13 14Z" />
        <path d="M13 11c3.5 0 6-2.2 6-5.5C15.5 5.5 13 7.5 13 11Z" />
      </svg>
    ),
  },
  {
    title: "Storage & garage",
    body: "The boxes of forgetting, sorted into keep, gift, and goodbye.",
    glyph: (
      <svg viewBox="0 0 26 26">
        <rect x="4" y="9" width="18" height="12" rx="1.5" />
        <path d="M4 13h18M10 9V6h6v3" />
      </svg>
    ),
  },
  {
    title: "Any pictured goal",
    body: "A race medal, a repaired bike, a gallery wall. Describe it, attach a photo, begin.",
    glyph: (
      <svg viewBox="0 0 26 26">
        <circle cx="13" cy="13" r="8" />
        <circle cx="13" cy="13" r="3.5" />
        <path d="M13 2v3M13 21v3M2 13h3M21 13h3" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="side-rail left" aria-hidden="true">
        <span className="rail-text">Molehill · A field guide to finishing</span>
      </div>
      <div className="side-rail right" aria-hidden="true">
        <span className="rail-text">Est. 2026 · Vol. 01</span>
      </div>

      <header className="topbar">
        <div className="container">
          <div className="topbar-inner">
            <span>
              <b>Vol. 01</b> — Field notes on gentle progress
            </span>
            <span className="mid">
              <span>The ADHD-friendly companion</span>
              <span>Nº 001</span>
            </span>
            <span className="right">
              <span>
                <i className="pulse" aria-hidden="true"></i>iOS · Android · coming soon
              </span>
              <a className="topbar-link" href="#waitlist">
                Early access
              </a>
            </span>
          </div>
        </div>
      </header>

      <SiteNav />

      <main id="main" className="shell">
        <section className="hero container" id="top">
          <div className="hero-grid">
            <div className="hero-copy">
              <Reveal as="span" className="index-label">
                A calmer way to get things done · Nº 01
              </Reveal>
              <h1 className="display">
                Big things, finished <em>gently</em>
                <span className="dot">.</span>
              </h1>
              <Reveal delay={90}>
                <p className="lead">
                  Molehill takes a photo of whatever feels like a mountain — the
                  cluttered room, the wild garden, the looming project — writes
                  a 12-step plan with a vision of the end state, then walks you
                  there three tiny steps a day.
                </p>
              </Reveal>
              <Reveal delay={180} className="hero-actions">
                <a className="btn-primary" href="#waitlist">
                  Join the waitlist
                </a>
                <a className="btn-ghost" href="#method">
                  See how it works
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path
                      d="M7 2v10M3 8.5 7 12l4-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </Reveal>
              <Reveal delay={270} className="hero-stats">
                <div className="stat">
                  <b>1</b>
                  <span>photo is all it takes to begin a plan</span>
                </div>
                <div className="stat">
                  <b>3</b>
                  <span>tiny steps a day — never more</span>
                </div>
                <div className="stat">
                  <b>0</b>
                  <span>guilt timers, streaks, or shame mechanics</span>
                </div>
              </Reveal>
            </div>
            <div className="hero-art">
              <figure style={{ margin: 0 }}>
                <Reveal variant="scale">
                  <div className="art-frame">
                    <div
                      className="plate"
                      role="img"
                      aria-label="Calm interior scene in soft morning light"
                    >
                      <div className="plate-sun"></div>
                      <div className="plate-beam"></div>
                      <figure className="arch">
                        <span className="glow"></span>
                        <span className="muntin-v"></span>
                        <span className="muntin-h"></span>
                      </figure>
                      <span className="sill"></span>
                      <svg className="sill-sprig" viewBox="0 0 64 64" aria-hidden="true">
                        <path
                          d="M30 60 C30 44 30 30 34 14"
                          fill="none"
                          stroke="oklch(0.38 0.03 166)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M33 26 C25 24 20 18 20 11 C28 13 32 19 33 26 Z"
                          fill="oklch(0.72 0.06 152)"
                          stroke="oklch(0.38 0.03 166)"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M34 34 C41 32 45 27 46 20 C38 22 34 27 34 34 Z"
                          fill="oklch(0.78 0.055 148)"
                          stroke="oklch(0.38 0.03 166)"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M32 46 C25 44 21 39 21 33 C28 35 31 40 32 46 Z"
                          fill="oklch(0.82 0.045 145)"
                          stroke="oklch(0.38 0.03 166)"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M22 60 h20"
                          stroke="oklch(0.38 0.03 166)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="deco-ring" aria-hidden="true"></span>
                      <span className="crosshair ch-1" aria-hidden="true"></span>
                      <span className="crosshair ch-2" aria-hidden="true"></span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="plate-photo" src="/images/hero.png" alt="" />
                    </div>
                    <figcaption className="plate-cap">
                      <span>Plate Nº 01 — Morning, eventually</span>
                      <span>Sage / ivory / light</span>
                    </figcaption>
                  </div>
                </Reveal>
              </figure>
            </div>
          </div>
        </section>

        <hr className="rule-dots" />

        <section className="about-strip sec-pad" id="weight">
          <div className="container">
            <div className="about-grid">
              <Reveal>
                <span className="index-label">The weight · Nº 02</span>
                <h2 className="display" style={{ marginTop: 18 }}>
                  It was never about <em>laziness</em>
                  <span className="dot">.</span>
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="pull-serif" style={{ marginBottom: 22 }}>
                  Big tasks don&apos;t fail because people stop caring. They fail
                  because the finish line is invisible and the next step is
                  nowhere to be seen.
                </p>
                <p className="body-copy">
                  So Molehill starts where motivation actually lives: your own
                  eyes. Show it the room, the desk, the yard, the goal. It
                  writes a plan — 12 steps, a vision of done, split into days —
                  then quietly hands you today&apos;s three. Small enough to start
                  on a low-battery day, real enough to matter. Momentum comes
                  back on its own once progress becomes visible again.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="sec-pad" id="method">
          <div className="container">
            <div className="sec-head">
              <span className="index-label">How it works · Nº 03</span>
              <Reveal>
                <h2 className="display" style={{ marginTop: 18 }}>
                  One loop, four <em>quiet</em> moves<span className="dot">.</span>
                </h2>
              </Reveal>
            </div>
            <div className="method-grid">
              {methodSteps.map((step, i) => (
                <Reveal key={step.no} delay={i * 110}>
                  <article className="method-step" style={{ height: "100%" }}>
                    <div className="step-no">
                      <span>{step.no}</span>
                      <span>{step.tag}</span>
                    </div>
                    <div className="step-glyph" aria-hidden="true">
                      {step.glyph}
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="app-section sec-pad" id="app">
          <div className="container">
            <div className="app-grid">
              <Reveal variant="left" className="phone-zone">
                <PhoneDemo />
              </Reveal>
              <div>
                <div className="sec-head" style={{ marginBottom: 40 }}>
                  <span className="index-label">Inside the app · Nº 04</span>
                  <Reveal>
                    <h2 className="display" style={{ marginTop: 18 }}>
                      A day in Molehill fits inside a <em>breath</em>
                      <span className="dot">.</span>
                    </h2>
                  </Reveal>
                </div>
                <div className="notes-list">
                  <Reveal delay={0} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <span className="note-no">01</span>
                    <div>
                      <h3>Snap, don&apos;t prepare</h3>
                      <p>
                        The photo is allowed to be honest. Messy rooms,
                        half-finished corners, the drawer everyone has. Starting
                        is one tap, not a ritual. The photo becomes a written
                        plan you can save or start today.
                      </p>
                    </div>
                  </Reveal>
                  <Reveal delay={120} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <span className="note-no">02</span>
                    <div>
                      <h3>A vision in words, an image if you want</h3>
                      <p>
                        Every plan includes a written vision — what done looks
                        like. If you want to see a rendered tidy version, tap to
                        generate one. But the plan works without it.
                      </p>
                    </div>
                  </Reveal>
                  <Reveal delay={240} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <span className="note-no">03</span>
                    <div>
                      <h3>Three steps, then rest</h3>
                      <p>
                        Try the preview — tap a step. Each tick moves the ring,
                        and the day closes gently when it&apos;s done. Overwhelm
                        doesn&apos;t stand a chance against small.
                      </p>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec-pad" id="spaces">
          <div className="container">
            <div className="sec-head">
              <span className="index-label">Where vision helps · Nº 05</span>
              <Reveal>
                <h2 className="display" style={{ marginTop: 18 }}>
                  If you can photograph it, Molehill can <em>plan it</em>
                  <span className="dot">.</span>
                </h2>
              </Reveal>
            </div>
            <div className="spaces-grid">
              {spaces.map((space, i) => (
                <Reveal key={space.title} delay={i * 80}>
                  <article className="space-tile" style={{ height: "100%" }}>
                    <div className="space-glyph" aria-hidden="true">
                      {space.glyph}
                    </div>
                    <h3>{space.title}</h3>
                    <p>{space.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="slab sec-pad" id="change">
          <div className="container">
            <div className="slab-grid">
              <div>
                <span className="index-label">Before / after · Nº 06</span>
                <Reveal>
                  <h2 className="display" style={{ marginTop: 18 }}>
                    Same corner. New <em>evening</em>
                    <span className="dot">.</span>
                  </h2>
                </Reveal>
                <Reveal>
                  <p className="lead" style={{ marginTop: 22 }}>
                    This is the whole promise: nothing magical happened to the
                    room. Twelve tiny visits did. Drag the divider — or use
                    arrow keys — to move through the change.
                  </p>
                </Reveal>
                <Reveal>
                  <div className="ba-cap">
                    <span>Catch of the day: one shelf, one basket, one plant watered</span>
                  </div>
                </Reveal>
              </div>
              <Reveal variant="right">
                <BeforeAfter />
                <div className="ba-cap">
                  <span>Fig. A — the corner, Tuesday</span>
                  <span>Fig. B — the corner, twelve small visits later</span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="sec-pad principles" id="principles">
          <div className="container">
            <Reveal as="span" className="index-label" >
              Principles · Nº 07
            </Reveal>
            <Reveal delay={90}>
              <blockquote className="principle-quote" style={{ marginTop: 34 }}>
                &ldquo;The goal was never a perfect room. It&apos;s a Tuesday
                evening that feels <span className="dot">light</span>.&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={180}>
              <div className="quote-attr">— From the Molehill field notes, № 2</div>
            </Reveal>
            <Reveal delay={270}>
              <div className="chip-row">
                <span className="chip"><i>·</i>Momentum over marathons</span>
                <span className="chip"><i>·</i>Pictures over pep talks</span>
                <span className="chip"><i>·</i>Rest counts as progress</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="cta-panel sec-pad" id="waitlist">
          <div className="container">
            <div className="cta-box">
              <Reveal as="span" className="index-label">
                Early access · Nº 08
              </Reveal>
              <Reveal>
                <h2 className="display" style={{ marginTop: 18 }}>
                  Start with one <em>photo</em>
                  <span className="dot">.</span>
                </h2>
              </Reveal>
              <Reveal delay={90}>
                <p className="lead">
                  Molehill is being finished in small, loving increments —
                  appropriately enough. Leave an email and you&apos;ll be among
                  the first through the window.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <WaitlistForm />
              </Reveal>
              <p className="cta-fine">
                One quiet email at launch, nothing else, ever.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand on-dark" href="#top">
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
              <p>
                A vision-led companion for big, overwhelming tasks. Made with
                and for ADHD minds.
              </p>
            </div>
            <div className="foot-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#method">How it works</a></li>
                <li><a href="#app">In the app</a></li>
                <li><a href="#spaces">Where it helps</a></li>
                <li><a href="#waitlist">Waitlist</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Studio</h4>
              <ul>
                <li><a href="#principles">Principles</a></li>
                <li><a href="#weight">Why Molehill exists</a></li>
                <li><a href="mailto:hello@molehills.app">hello@molehills.app</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Fine print</h4>
              <ul>
                <li><a href="#top">Privacy, briefly</a></li>
                <li><a href="#top">Terms, humanly</a></li>
                <li><a href="#top">Accessibility</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="foot-mega">
          <div className="container">
            <Reveal variant="rise-lg">
              <div className="word">
                Go <em>gently</em>
                <span className="dot">.</span>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="container">
          <div className="fine-print">
            <span>© 2026 Molehill · MoleHills.app</span>
            <span>Imagery drawn in-page · No photos were shamed</span>
            <span>Vol. 01 · Nº 001</span>
          </div>
        </div>
      </footer>
    </>
  );
}
