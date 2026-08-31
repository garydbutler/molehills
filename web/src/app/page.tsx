import Reveal from "@/components/Reveal";
import SiteNav from "@/components/SiteNav";
import PhoneDemo from "@/components/PhoneDemo";
import BeforeAfter from "@/components/BeforeAfter";
import WaitlistForm from "@/components/WaitlistForm";
import { CONTACT_EMAIL } from "@/lib/site";

const methodSteps = [
  {
    no: "Step 01",
    tag: "Capture",
    title: "Show us where it stands",
    body: "Photograph whatever you want to change, mess and all — or just write a sentence about it. Either way Inchmeal writes a plan: a name for the project, one line describing what done looks like, and about 12 small steps sorted into days. Start it now or save it for later.",
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
    title: "See what done looks like",
    body: "Every plan opens with one sentence describing the finished result. If a picture would help more than words, you can generate one, but the plan works fine without it.",
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
    body: "The work is cut into steps of a few minutes each. Each day gives you three of them and never a fourth. Finish those and the day is done, with nothing left nagging in the background.",
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
    body: "Your projects wait in the Journey tab until you come back to them. To finish a day you show what changed — photograph the space again, or say it in a sentence. Inchmeal closes the day on the change, not on a ticked box.",
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
    body: "The most common one. Turn a living room back into somewhere you actually want to sit.",
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
    body: "Papers, cables, and the pile you stopped looking at, cleared back to a usable surface.",
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
    body: "An overgrown bed brought back under control, one handful of weeds at a time.",
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
    body: "The boxes you keep meaning to deal with, sorted into keep, donate, and toss.",
    glyph: (
      <svg viewBox="0 0 26 26">
        <rect x="4" y="9" width="18" height="12" rx="1.5" />
        <path d="M4 13h18M10 9V6h6v3" />
      </svg>
    ),
  },
  {
    title: "Things with nothing to photograph",
    body: "The application. The tax return. The thing you'd rather nobody saw. Describe it in a sentence and you get the same plan — and you close each day by saying what changed.",
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
        <span className="rail-text">Inchmeal · A field guide to finishing</span>
      </div>
      <div className="side-rail right" aria-hidden="true">
        <span className="rail-text">Est. 2026 · Vol. 01</span>
      </div>

      <header className="topbar">
        <div className="container">
          <div className="topbar-inner">
            <span>
              <b>Vol. 01</b> · Field notes on steady progress
            </span>
            <span className="mid">
              <span>The ADHD-friendly companion</span>
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
                The ADHD-friendly app for tasks too big to start
              </Reveal>
              <h1 className="display">
                Big things, finished <em>gently</em>
                <span className="dot">.</span>
              </h1>
              <Reveal delay={80}>
                <p className="hero-deck">
                  Show Inchmeal where the thing stands — a photo, or one
                  sentence. It writes the plan and gives you three small steps a
                  day, never a fourth.
                </p>
              </Reveal>
              <Reveal delay={115}>
                <aside className="name-definition" aria-label="Meaning of Inchmeal">
                  <p className="name-definition-term">
                    <strong>Inchmeal</strong>
                    <span>adverb</span>
                  </p>
                  <p className="name-definition-meaning">
                    Inch by inch; little by little.
                  </p>
                  <p className="name-definition-note">
                    Here, it means turning something too big to start into
                    small steps you can actually finish.
                  </p>
                </aside>
              </Reveal>
              <Reveal delay={150}>
                <p className="lead">
                  The task that won&apos;t start usually isn&apos;t laziness — it&apos;s
                  not being able to see the finish line or the next step. So
                  Inchmeal makes both: a line describing what done looks like,
                  and three small steps to get there each day. A day ends when
                  something has actually changed — you photograph it, or you say
                  what moved. Never a ticked box.
                </p>
              </Reveal>
              <Reveal delay={230} className="hero-actions">
                <a className="btn-primary" href="#waitlist">
                  Get early access
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
              <Reveal delay={310} className="hero-stats">
                <div className="stat">
                  <b>1</b>
                  <span>photo, or a sentence, to start a plan</span>
                </div>
                <div className="stat">
                  <b>3</b>
                  <span>small steps a day, never more</span>
                </div>
                <div className="stat">
                  <b>0</b>
                  <span>streaks, timers, or guilt trips</span>
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
                      <span>A calm morning</span>
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
                <span className="index-label">The weight</span>
                <h2 className="display" style={{ marginTop: 18 }}>
                  It was never about <em>laziness</em>
                  <span className="dot">.</span>
                </h2>
                <p className="body-copy" style={{ marginTop: 22 }}>
                  Every other app rewards the streak. Inchmeal rewards
                  finishing — then stopping.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <p className="pull-serif" style={{ marginBottom: 22 }}>
                  Big tasks don&apos;t fail because you stopped caring. They fail
                  because you can&apos;t see the finish line, and the next step
                  isn&apos;t obvious.
                </p>
                <p className="body-copy">
                  So Inchmeal starts with something you can already do: point
                  your camera at the problem, or write one honest sentence about
                  it. Either way it writes a plan of about 12 steps, sorted into
                  days, with a short note on
                  what finished looks like. Then it hands you the first three. On
                  a rough day you can ask for just one. The steps are small
                  enough to manage when you have nothing left in the tank, and
                  once you can see the pile getting smaller, the urge to keep
                  going usually comes back on its own.
                </p>
                <p className="pull-serif" style={{ marginTop: 26 }}>
                  The mountain was never the problem. It only ever needed to be
                  taken little, and often<span className="dot">.</span>
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="sec-pad" id="method">
          <div className="container">
            <div className="sec-head">
              <span className="index-label">How it works</span>
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
                  <span className="index-label">Inside the app</span>
                  <Reveal>
                    <h2 className="display" style={{ marginTop: 18 }}>
                      Most days you&apos;re in and out in under a <em>minute</em>
                      <span className="dot">.</span>
                    </h2>
                  </Reveal>
                </div>
                <div className="notes-list">
                  <Reveal delay={0} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <span className="note-no">01</span>
                    <div>
                      <h3>Don&apos;t tidy first</h3>
                      <p>
                        If you do use the camera, the photo is supposed to be
                        honest — so don&apos;t clean up for it. A messy room or a
                        half-finished corner is exactly what Inchmeal wants to
                        see. One tap turns it into a plan you can start now or
                        come back to later.
                      </p>
                    </div>
                  </Reveal>
                  <Reveal delay={120} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <span className="note-no">02</span>
                    <div>
                      <h3>Or skip the camera entirely</h3>
                      <p>
                        Some work has nothing to photograph, and some of it is
                        nobody else&apos;s business. Write a sentence instead and
                        you get the same plan — then close each day by saying
                        what changed. We never ask to see the work itself.
                      </p>
                    </div>
                  </Reveal>
                  <Reveal delay={240} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <span className="note-no">03</span>
                    <div>
                      <h3>Try it here</h3>
                      <p>
                        Tap a step in the preview. The ring fills as you check
                        things off, and the day wraps up on its own once all
                        three are done.
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
              <span className="index-label">Where it helps</span>
              <Reveal>
                <h2 className="display" style={{ marginTop: 18 }}>
                  If you can describe it, Inchmeal can <em>plan it</em>
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
                <span className="index-label">Before / after</span>
                <Reveal>
                  <h2 className="display" style={{ marginTop: 18 }}>
                    The same corner, twelve steps <em>later</em>
                    <span className="dot">.</span>
                  </h2>
                </Reveal>
                <Reveal>
                  <p className="lead" style={{ marginTop: 22 }}>
                    Nothing dramatic happened to this room. Twelve small
                    sessions did the work. Drag the divider (or use the arrow
                    keys) to move through the change.
                  </p>
                </Reveal>
                <Reveal>
                  <div className="ba-cap">
                    <span>One visit&apos;s work: a shelf cleared and the plant finally watered</span>
                  </div>
                </Reveal>
              </div>
              <Reveal variant="right">
                <BeforeAfter />
                <div className="ba-cap">
                  <span>Fig. A · The corner on Tuesday</span>
                  <span>Fig. B · The same corner, twelve visits later</span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="sec-pad principles" id="principles">
          <div className="container">
            <Reveal as="span" className="index-label" >
              Principles
            </Reveal>
            <Reveal delay={90}>
              <blockquote className="principle-quote" style={{ marginTop: 34 }}>
                &ldquo;The goal was never a perfect room. It&apos;s a Tuesday
                evening that feels <span className="dot">light</span>.&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={180}>
              <div className="quote-attr">From the Inchmeal principles</div>
            </Reveal>
            <Reveal delay={270}>
              <div className="chip-row">
                <span className="chip"><i>·</i>A few minutes a day</span>
                <span className="chip"><i>·</i>See real progress</span>
                <span className="chip"><i>·</i>Rest is allowed</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="cta-panel sec-pad" id="waitlist">
          <div className="container">
            <div className="cta-box">
              <Reveal as="span" className="index-label">
                Early access
              </Reveal>
              <Reveal>
                <h2 className="display" style={{ marginTop: 18 }}>
                  One photo. Or one <em>sentence</em>
                  <span className="dot">.</span>
                </h2>
              </Reveal>
              <Reveal delay={90}>
                <p className="lead">
                  We&apos;re building Inchmeal a little at a time, which feels
                  about right. Leave your email and we&apos;ll tell you the moment
                  it&apos;s ready to try.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <WaitlistForm />
              </Reveal>
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
                Inchmeal<span className="dot">.</span>
              </a>
              <p>
Little and often. A companion for the tasks that feel too big to
                begin, made for people with ADHD.
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
                <li><a href="#weight">Why Inchmeal exists</a></li>
                <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Fine print</h4>
              <ul>
                <li><a href="/privacy-policy">Privacy</a></li>
                <li><a href="/terms-of-service">Terms</a></li>
                <li><a href="/support">Support</a></li>
                <li><a href="#top">Accessibility</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="foot-mega">
          <div className="container">
            <Reveal variant="rise-lg">
              <div className="word">
                Start <em>small</em>
                <span className="dot">.</span>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="container">
          <div className="fine-print">
            <span>© 2026 Inchmeal · Inchmeal.app</span>
            <span>Illustrations drawn in the page</span>
            <span>Vol. 01</span>
          </div>
        </div>
      </footer>
    </>
  );
}
