"use client";

import { useState } from "react";

const beforeShapes: React.CSSProperties[] = [
  { left: "8%", bottom: "18%", width: "17%", height: "26%", background: "oklch(0.37 0.075 285)", transform: "rotate(-7deg)", border: "1px solid var(--dusk-line)" },
  { left: "20%", bottom: "18%", width: "15%", height: "20%", background: "oklch(0.40 0.075 285)", transform: "rotate(5deg)", border: "1px solid var(--dusk-line)" },
  { left: "33%", bottom: "18%", width: "19%", height: "31%", background: "oklch(0.35 0.070 285)", transform: "rotate(-3deg)", border: "1px solid var(--dusk-line)" },
  { left: "56%", bottom: "18%", width: "14%", height: "16%", background: "oklch(0.42 0.078 285)", transform: "rotate(9deg)", border: "1px solid var(--dusk-line)" },
  { left: "70%", bottom: "18%", width: "18%", height: "24%", background: "oklch(0.38 0.075 285)", transform: "rotate(-11deg)", border: "1px solid var(--dusk-line)" },
  { left: "47%", bottom: "49%", width: "12%", height: "9%", background: "oklch(0.44 0.075 286)", transform: "rotate(14deg)", border: "1px solid var(--dusk-line)" },
  { left: "14%", bottom: "52%", width: "10%", height: "7%", background: "oklch(0.43 0.075 286)", transform: "rotate(-9deg)", border: "1px solid var(--dusk-line)" },
];

const afterShapes: React.CSSProperties[] = [
  { left: "12%", bottom: "18%", width: "26%", height: "34%", background: "oklch(0.56 0.130 285)", borderRadius: "14px 14px 4px 4px", border: "1px solid oklch(0.955 0.014 88 / 0.25)" },
  { left: "15%", bottom: "52%", width: "20%", height: "5%", background: "oklch(0.62 0.110 287)", borderRadius: "6px", border: "1px solid oklch(0.955 0.014 88 / 0.25)" },
  { left: "52%", bottom: "18%", width: "12%", height: "12%", background: "oklch(0.50 0.120 285)", borderRadius: "4px", border: "1px solid oklch(0.955 0.014 88 / 0.25)" },
  { left: "57%", bottom: "30%", width: "2%", height: "14%", background: "oklch(0.75 0.080 290)" },
  { left: "51%", bottom: "38%", width: "14%", height: "10%", background: "oklch(0.68 0.105 290)", borderRadius: "60% 60% 20% 20%", border: "1px solid oklch(0.955 0.014 88 / 0.25)" },
  { right: "10%", top: "10%", width: "26%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.83 0.09 85 / 0.75), transparent 68%)" },
];

export default function BeforeAfter() {
  const [value, setValue] = useState(55);

  return (
    <div className="ba-frame">
      <div
        className="ba-layer ba-before"
        style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        aria-hidden="true"
      >
        {beforeShapes.map((style, i) => (
          <span key={i} className="ba-shape" style={style} />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ba-photo" src="/images/before.png" alt="" />
      </div>
      <div className="ba-layer ba-after" aria-hidden="true">
        {afterShapes.map((style, i) => (
          <span key={i} className="ba-shape" style={style} />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ba-photo" src="/images/after.png" alt="" />
      </div>
      <span className="ba-label before" style={{ opacity: value > 72 ? 0 : 1 }}>
        Before
      </span>
      <span className="ba-label after" style={{ opacity: value < 28 ? 0 : 1 }}>
        After
      </span>
      <span className="ba-handle" style={{ left: `${value}%` }} aria-hidden="true"></span>
      <input
        className="ba-range"
        type="range"
        min={0}
        max={100}
        value={value}
        step={1}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Reveal more or less of the after image"
      />
    </div>
  );
}
