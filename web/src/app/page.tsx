import Image from "next/image";
import PhoneToday from "@/components/PhoneToday";
import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";

// Banner crop used for the small wordmark in the header + footer.
const wordmark: React.CSSProperties = {
  display: "block",
  width: 96,
  height: 27,
  backgroundImage: "url(/images/unbig-banner.png)",
  backgroundSize: "345% auto",
  backgroundPosition: "71% 10.9%",
  backgroundRepeat: "no-repeat",
};

const methodBars = [
  { h: 44, c: "#E4886E", no: "01", title: "Clarify", body: "Photograph the thing, mess and all — or write a sentence. Unbig names the project and describes what done looks like." },
  { h: 74, c: "#EDBE5C", no: "02", title: "Break it down", body: "About twelve steps of a few minutes each, sorted into days you can face. Start now or save it for later." },
  { h: 108, c: "#A5C296", no: "03", title: "Do one small thing", body: "Each day gives you three steps and never a fourth. Finish them and the day is closed. Nothing nags." },
  { h: 146, c: "#7E9BE0", no: "04", title: "Feel progress", body: "Close the day by showing what changed — a second photo, or a sentence. The day ends on the change, not a ticked box." },
];

const spaces = [
  ["Cluttered rooms", "The most common one. A living room turned back into somewhere you actually want to sit."],
  ["Desk resets", "Papers, cables, and the pile you stopped looking at, cleared back to a usable surface."],
  ["Gardens & yards", "An overgrown bed brought back under control, one handful of weeds at a time."],
  ["Storage & garage", "The boxes you keep meaning to deal with, sorted into keep, donate, and toss."],
  ["Nothing to photograph", "The application. The tax return. The thing you'd rather nobody saw. One sentence gets the same plan, and you close each day by saying what changed."],
];

const line = "1px solid rgba(33,28,78,.14)";
const faint = "#8B87A3";
const muted = "#4A4570";
const ink = "#211C4E";

export default function Home() {
  return (
    <div
      className="unbig-site"
      style={{ fontFamily: "var(--font-body), system-ui, sans-serif", color: ink, background: "#F8F5EF", overflowX: "hidden" }}
    >
      <style>{`
        .unbig-site a{color:#211C4E;text-decoration:none}
        .unbig-site a:hover{color:#6D5BE3}
        .unbig-site ::selection{background:#DED8FA;color:#211C4E}
        .unbig-nav a:hover{color:#211C4E !important}
        .unbig-early{border-bottom:2px solid #C9C2EE;padding-bottom:1px}
        .unbig-early:hover{border-bottom-color:#6D5BE3}
        .unbig-cta{background:#6D5BE3;color:#fff !important;transition:background .18s}
        .unbig-cta:hover{background:#5B49D6}
        .unbig-hero-cta{padding:clamp(9px,1.2vw,15px) clamp(15px,1.9vw,28px);font-size:clamp(12.5px,1.3vw,16.5px);box-shadow:0 12px 26px -12px rgba(109,91,227,.75)}
        .unbig-hero-cta:focus-visible{outline:2px solid #211C4E;outline-offset:3px}
        /* Reuse WaitlistForm logic, restyle + centre for the dark band */
        .unbig-waitlist .waitlist{max-width:480px;margin:28px auto 0}
        .unbig-waitlist .waitlist-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
        .unbig-waitlist input{flex:1;min-width:200px;padding:14px 18px;border-radius:999px;border:1px solid rgba(248,245,239,.25);background:rgba(248,245,239,.06);font-size:16px;font-family:var(--font-body),sans-serif;color:#F8F5EF;outline:none}
        .unbig-waitlist input::placeholder{color:#9C95CF}
        .unbig-waitlist input:focus{border-color:#C9C2EE}
        .unbig-waitlist .btn-primary{background:#6D5BE3;color:#fff;border:none;padding:14px 24px;border-radius:999px;font-size:16px;font-weight:600;font-family:var(--font-body),sans-serif;cursor:pointer;transition:background .18s}
        .unbig-waitlist .btn-primary:hover{background:#8471F0}
        .unbig-waitlist .btn-primary:disabled{opacity:.6;cursor:default}
        .unbig-waitlist .waitlist-msg{margin:12px 4px 0;font-size:14px;color:#C9C2EE;min-height:1em;text-align:center}
        .unbig-waitlist .waitlist-msg.err{color:#F0B4A0}
        .unbig-waitlist .cta-fine{margin:14px 4px 0;font-size:13.5px;color:#9C95CF;text-align:center}
        .unbig-waitlist .waitlist-done{color:#EDE9FB;max-width:520px;margin:28px auto 0;text-align:center}
        .unbig-waitlist .waitlist-done .big{font-size:24px;font-weight:300;margin:0}
        .unbig-waitlist .share-lead{color:#9C95CF;text-align:center}
        .unbig-waitlist .share-status{text-align:center}
        .unbig-waitlist .share-link{border-color:rgba(248,245,239,.22);color:#C9C2EE;background:transparent}
        .unbig-waitlist .share-link:hover{border-color:#C9C2EE;color:#fff;background:rgba(248,245,239,.06)}
        .unbig-footbar a{color:#C9C2EE}
        .unbig-footbar a:hover{color:#fff !important}
        @media (max-width:860px){
          .unbig-grid{grid-template-columns:1fr !important;gap:40px !important}
          .unbig-h1{font-size:38px !important}
          .unbig-method-bars,.unbig-method-copy{grid-template-columns:repeat(2,1fr) !important}
          .unbig-nav{display:none !important}
          .unbig-footbar{flex-direction:column;justify-content:center;gap:16px}
        }
      `}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(248,245,239,.92)", backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 36px", display: "flex", alignItems: "center", gap: 36 }}>
          <a href="#top" aria-label="Unbig" style={wordmark} />
          <nav className="unbig-nav" style={{ display: "flex", gap: 28, fontSize: 15, color: muted }}>
            <a href="#method" style={{ color: muted }}>How it works</a>
            <a href="#app" style={{ color: muted }}>The app</a>
            <a href="#spaces" style={{ color: muted }}>Where it helps</a>
          </nav>
          <div style={{ flex: 1 }} />
          <a href="#waitlist" className="unbig-early" style={{ fontSize: 15, fontWeight: 600, color: "#6D5BE3" }}>Get early access</a>
        </div>
      </header>

      {/* Hero */}
      <section id="top">
        <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 12px" }}>
          <div style={{ position: "relative" }}>
            <Image
              src="/images/unbig-hero.png"
              alt="Unbig — make big things small enough to start"
              width={1800}
              height={600}
              priority
              style={{ display: "block", width: "100%", height: "auto", borderRadius: 6 }}
            />
            {/* Real CTA over the spot the banner art leaves for it (painted button removed from the PNG). */}
            <a href="#waitlist" className="unbig-cta unbig-hero-cta" style={{ position: "absolute", left: "57.2%", top: "61.5%", transform: "translate(-50%,-50%)", borderRadius: 999, fontWeight: 600, whiteSpace: "nowrap" }}>
              Get early access <span style={{ marginLeft: 6 }}>→</span>
            </a>
          </div>
        </div>
        <div className="unbig-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 36px 88px", display: "grid", gridTemplateColumns: "minmax(0,7fr) minmax(0,4fr)", gap: 64, alignItems: "end" }}>
          <Reveal>
            <h1 className="unbig-h1" style={{ margin: "0 0 22px", fontSize: 54, lineHeight: 1.08, fontWeight: 300, letterSpacing: "-.02em", textWrap: "balance" }}>
              Show it the task you can&apos;t start. It hands you three small steps a day — never a fourth.
            </h1>
            <p style={{ margin: "0 0 30px", fontSize: 18, lineHeight: 1.6, color: muted, maxWidth: "54ch", textWrap: "pretty" }}>
              A photo of the mess, or one honest sentence about it. Unbig writes the plan, says what finished looks like, and keeps the next step small enough to actually do. Built for ADHD minds and anyone stuck.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: faint }}>iOS · Android · coming soon</p>
          </Reveal>
          <Reveal delay={140} as="div">
            <dl style={{ margin: 0, display: "grid", gap: 0, fontSize: 15, color: muted, borderTop: line }}>
              {[["1", "photo, or one sentence, to start a plan"], ["3", "small steps a day, never more"], ["0", "streaks, timers, or guilt"]].map(([n, t]) => (
                <div key={n} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 14, alignItems: "baseline", padding: "16px 0", borderBottom: line }}>
                  <dt style={{ fontSize: 32, fontWeight: 300, color: ink, letterSpacing: "-.02em" }}>{n}</dt>
                  <dd style={{ margin: 0 }}>{t}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Why Unbig exists */}
      <section id="weight" style={{ borderTop: "1px solid rgba(33,28,78,.12)" }}>
        <div className="unbig-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 36px 96px", display: "grid", gridTemplateColumns: "minmax(0,4fr) minmax(0,7fr)", gap: 64 }}>
          <Reveal style={{ position: "relative" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-serif), cursive", fontSize: 30, lineHeight: 1.2, color: "#6E6A8C", transform: "rotate(-3deg)", maxWidth: 220 }}>
              So much to do. Where do I even start?
            </p>
            <p style={{ margin: "56px 0 0", fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", color: faint }}>Why Unbig exists</p>
          </Reveal>
          <Reveal delay={120} style={{ fontSize: 19, lineHeight: 1.65, color: ink, maxWidth: "58ch", textWrap: "pretty" }}>
            <p style={{ margin: "0 0 22px", fontSize: 30, lineHeight: 1.3, fontWeight: 300, letterSpacing: "-.01em" }}>It was never about laziness.</p>
            <p style={{ margin: "0 0 20px", color: muted }}>Big tasks don&apos;t fail because you stopped caring. They fail because you can&apos;t see the finish line, and the next step isn&apos;t obvious. Every other app answers that with a streak. We answer it with a smaller step.</p>
            <p style={{ margin: "0 0 20px", color: muted }}>So Unbig starts with something you can already do: point your camera at the problem, or write one sentence about it. It writes a plan of about twelve steps sorted into days, with a line describing what done looks like, and hands you the first three. On a rough day, ask for just one.</p>
            <p style={{ margin: 0, color: muted }}>The mountain was never the problem. It only needed to be broken into pieces you could pick up.</p>
          </Reveal>
        </div>
      </section>

      {/* Method */}
      <section id="method" style={{ background: "#FFFDF8", borderTop: "1px solid rgba(33,28,78,.12)", borderBottom: "1px solid rgba(33,28,78,.12)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 36px 96px" }}>
          <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 32, flexWrap: "wrap", marginBottom: 64 }}>
            <h2 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, fontWeight: 300, letterSpacing: "-.02em" }}>The same four moves, every time.</h2>
            <p style={{ margin: 0, fontSize: 15, color: faint }}>Most days: under a minute in the app.</p>
          </Reveal>
          <Reveal variant="rise-lg" className="unbig-method-bars" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, alignItems: "end", borderBottom: line }}>
            {methodBars.map((m) => (
              <div key={m.no}><div style={{ height: m.h, margin: "0 28px 0 0", background: m.c, borderRadius: "3px 3px 0 0" }} /></div>
            ))}
          </Reveal>
          <Reveal delay={120} className="unbig-method-copy" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
            {methodBars.map((m) => (
              <div key={m.no} style={{ padding: "22px 28px 0 0" }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: faint }}>{m.no}</p>
                <h3 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 600, letterSpacing: "-.01em" }}>{m.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>{m.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* The app */}
      <section id="app">
        <div className="unbig-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 36px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 96, alignItems: "center" }}>
          <Reveal variant="left" style={{ maxWidth: "56ch" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 40, lineHeight: 1.1, fontWeight: 300, letterSpacing: "-.02em", textWrap: "balance" }}>Today is three lines long. That&apos;s the whole screen.</h2>
            <p style={{ margin: "0 0 36px", fontSize: 17, lineHeight: 1.65, color: muted }}>Tap a step in the preview. The ring fills as you go, and the day wraps up on its own once all three are done.</p>
            <div style={{ display: "grid", gap: 0, borderTop: line }}>
              {[
                ["Don't tidy first", "The photo is supposed to be honest. A half-finished corner is exactly what Unbig wants to see."],
                ["Or skip the camera", "Some work has nothing to photograph, and some of it is nobody's business. A sentence gets the same plan. We never ask to see the work itself."],
                ["Come back when ready", "Projects wait in the Journey tab. There's no streak to lose."],
              ].map(([h, b]) => (
                <div key={h} style={{ padding: "18px 0", borderBottom: line }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>{h}</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <PhoneToday />
          </Reveal>
        </div>
      </section>

      {/* Where it helps */}
      <section id="spaces" style={{ background: "#FFFDF8", borderTop: "1px solid rgba(33,28,78,.12)", borderBottom: "1px solid rgba(33,28,78,.12)" }}>
        <div className="unbig-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 36px 96px", display: "grid", gridTemplateColumns: "minmax(0,4fr) minmax(0,7fr)", gap: 64 }}>
          <Reveal>
            <h2 style={{ margin: "0 0 14px", fontSize: 40, lineHeight: 1.1, fontWeight: 300, letterSpacing: "-.02em" }}>If you can describe it, Unbig can plan it.</h2>
            <p style={{ margin: 0, fontSize: 15, color: faint }}>The five kinds of stuck we hear about most.</p>
          </Reveal>
          <Reveal delay={120} style={{ borderTop: line }}>
            {spaces.map(([h, b]) => (
              <div key={h} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, padding: "20px 0", borderBottom: line, alignItems: "baseline" }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{h}</h3>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: muted }}>{b}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section id="principles">
        <div className="unbig-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "112px 36px", display: "grid", gridTemplateColumns: "minmax(0,4fr) minmax(0,7fr)", gap: 64, alignItems: "start" }}>
          <Reveal as="div" style={{ margin: 0, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", color: faint }}>From the principles</Reveal>
          <Reveal variant="rise-lg" delay={120}>
            <blockquote style={{ margin: 0, fontSize: 38, lineHeight: 1.25, fontWeight: 300, letterSpacing: "-.015em", textWrap: "balance", maxWidth: "24ch" }}>
              The goal was never a perfect room. It&apos;s a Tuesday evening that feels light.
            </blockquote>
            <p style={{ margin: "28px 0 0", fontSize: 16, color: muted }}>A few minutes a day &nbsp;·&nbsp; See real progress &nbsp;·&nbsp; Rest is allowed</p>
          </Reveal>
        </div>
      </section>

      {/* Waitlist + footer — one dark band, centred CTA */}
      <footer id="waitlist" className="unbig-waitlist" style={{ background: ink, color: "#F8F5EF" }}>
        <Reveal style={{ maxWidth: 720, margin: "0 auto", padding: "88px 36px 0", textAlign: "center" }}>
          <p style={{ margin: "0 0 12px", fontFamily: "var(--font-serif), cursive", fontSize: 23, lineHeight: 1, color: "#B8B2DE" }}>Little and often.</p>
          <h2 style={{ margin: "0 auto", maxWidth: "20ch", fontSize: 42, lineHeight: 1.1, fontWeight: 300, letterSpacing: "-.02em", textWrap: "balance" }}>One photo. Or one sentence. We&apos;ll do the rest.</h2>
          <WaitlistForm />
        </Reveal>

        <div style={{ maxWidth: 1200, margin: "56px auto 0", padding: "0 36px" }}>
          <div className="unbig-footbar" style={{ borderTop: "1px solid rgba(248,245,239,.14)", padding: "22px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap", fontSize: 14.5 }}>
            <a href="#top" aria-label="Unbig" style={{ fontFamily: "var(--font-tight), sans-serif", fontSize: 19, fontWeight: 700, letterSpacing: "-.01em", color: "#F8F5EF" }}>Unbig</a>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              <a href="#method">How it works</a><a href="#app">The app</a><a href="#spaces">Where it helps</a><a href="#principles">Principles</a>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              <a href="/privacy-policy">Privacy</a><a href="/terms-of-service">Terms</a><a href="/support">Support</a>
            </div>
          </div>
          <p style={{ margin: "16px 0 40px", textAlign: "center", fontSize: 13, color: "#756FA0" }}>© 2026 Unbig · unbig.app · formerly Inchmeal</p>
        </div>
      </footer>
    </div>
  );
}
