"use client";

import { useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};

function storedWaitlisted() {
  try {
    return window.localStorage.getItem("molehill-waitlisted") === "1";
  } catch {
    return false;
  }
}

function serverWaitlisted() {
  return false;
}

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState<"err" | "ok" | null>(null);
  const [justJoined, setJustJoined] = useState<null | { emailed: boolean }>(null);
  const [busy, setBusy] = useState(false);

  const previouslyJoined = useSyncExternalStore(
    subscribe,
    storedWaitlisted,
    serverWaitlisted,
  );
  const done = justJoined !== null || previouslyJoined;

  if (done) {
    return (
      <div className="waitlist-done show">
        <p className="big">
          You&apos;re on the list<span className="dot">.</span>
        </p>
        {justJoined?.emailed && (
          <p style={{ marginTop: 12 }}>
            We sent a confirmation link to <b>{email.trim()}</b>. It doesn&apos;t
            expire, so confirm whenever you like.
          </p>
        )}
        <p style={{ marginTop: 12 }}>
          We&apos;ll email you once — the day Molehill&apos;s ready to try. Nothing
          before that.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setMsg("That email address looks incomplete. Mind checking it?");
      setMsgKind("err");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { emailed?: boolean };
      try {
        window.localStorage.setItem("molehill-waitlisted", "1");
      } catch {
        // ignore storage errors
      }
      setJustJoined({ emailed: Boolean(data.emailed) });
    } catch {
      setMsg("Something went wrong on our end. Please try again.");
      setMsgKind("err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form className="waitlist" noValidate onSubmit={onSubmit}>
        <div className="waitlist-row">
          <label
            htmlFor="waitlist-email"
            style={{ position: "absolute", left: -9999 }}
          >
            Email address
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={busy}>
            Get early access
          </button>
        </div>
        <p
          className={`waitlist-msg${msgKind ? ` ${msgKind}` : ""}`}
          role="status"
          aria-live="polite"
        >
          {msg}
        </p>
      </form>
    </>
  );
}
