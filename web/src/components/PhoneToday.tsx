"use client";

import { useState } from "react";

const STEPS = [
  ["Clear the top of the desk into one box", "4 min"],
  ["Bag the recycling by the window", "6 min"],
  ["Photograph the corner you finished", "1 min"],
] as const;

// Ported from the Unbig design canvas (Unbig.dc.html) DCLogic component.
export default function PhoneToday() {
  const [done, setDone] = useState([false, false, false]);
  const count = done.filter(Boolean).length;
  const deg = Math.round((count / 3) * 360);

  const ringNote =
    count === 3
      ? "That's the day. Nothing else is asked of you."
      : count === 0
        ? "Three small steps waiting. Start anywhere."
        : `Good. ${3 - count} left, then you're done.`;
  const footNote =
    count === 3 ? "Day closed · come back tomorrow" : "Rough day? Ask for just one.";

  return (
    <div style={{ position: "relative" }}>
      <p
        style={{
          position: "absolute",
          right: -24,
          top: -40,
          margin: 0,
          fontFamily: "var(--font-serif), cursive",
          fontSize: 24,
          color: "#6E6A8C",
          transform: "rotate(4deg)",
        }}
      >
        tap one ↓
      </p>
      <div
        style={{
          width: 340,
          maxWidth: "100%",
          background: "#211C4E",
          borderRadius: 44,
          padding: 11,
          boxShadow: "0 30px 60px -24px rgba(33,28,78,.4)",
        }}
      >
        <div style={{ background: "#F8F5EF", borderRadius: 34, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 22px 4px",
              fontSize: 12,
              fontWeight: 700,
              color: "#211C4E",
            }}
          >
            <span>9:41</span>
            <span style={{ color: "#8B87A3" }}>▮▮▮</span>
          </div>
          <div style={{ padding: "14px 22px 8px" }}>
            <p style={{ margin: "0 0 2px", fontSize: 12, color: "#8B87A3" }}>Tuesday</p>
            <h4 style={{ margin: 0, fontSize: 24, fontWeight: 300, letterSpacing: "-.01em" }}>
              The spare room
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 22px 16px" }}>
            <div
              style={{
                position: "relative",
                width: 62,
                height: 62,
                borderRadius: 999,
                background: "#EFECFD",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: `conic-gradient(#6D5BE3 ${deg}deg,#E3DEF6 0)`,
                  WebkitMask: "radial-gradient(circle,transparent 25px,#000 26px)",
                  mask: "radial-gradient(circle,transparent 25px,#000 26px)",
                  transition: "background .3s",
                }}
              />
              <span style={{ fontSize: 15, fontWeight: 700, color: "#6D5BE3" }}>{count}/3</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#4A4570" }}>{ringNote}</p>
          </div>
          <div style={{ padding: "0 16px 18px", display: "grid", gap: 10 }}>
            {STEPS.map(([label, mins], i) => {
              const on = done[i];
              return (
                <button
                  key={label}
                  onClick={() =>
                    setDone((s) => {
                      const next = s.slice();
                      next[i] = !next[i];
                      return next;
                    })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: 14,
                    borderRadius: 16,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-body), sans-serif",
                    transition: "background .18s,border-color .18s",
                    background: on ? "#EFECFD" : "#FFFDF8",
                    border: `1px solid ${on ? "#C9C2EE" : "rgba(33,28,78,.10)"}`,
                    opacity: on ? 0.75 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      background: on ? "#6D5BE3" : "transparent",
                      border: on ? "none" : "2px solid #C9C2EE",
                    }}
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "left",
                      fontSize: 14.5,
                      lineHeight: 1.45,
                      color: "#211C4E",
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 12, color: "#8B87A3" }}>{mins}</span>
                </button>
              );
            })}
            <p
              style={{
                margin: "6px 4px 0",
                fontSize: 13,
                lineHeight: 1.5,
                color: "#8B87A3",
                textAlign: "center",
              }}
            >
              {footNote}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "12px 0 18px",
              borderTop: "1px solid rgba(33,28,78,.08)",
              fontSize: 11.5,
              color: "#8B87A3",
            }}
          >
            <span style={{ color: "#6D5BE3", fontWeight: 700 }}>Today</span>
            <span>Journey</span>
            <span>Capture</span>
            <span>You</span>
          </div>
        </div>
      </div>
    </div>
  );
}
