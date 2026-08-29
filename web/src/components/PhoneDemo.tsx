"use client";

import { useState } from "react";

type Task = { label: string; meta: string };

const initialTasks: Task[] = [
  { label: "Put the mugs in the sink", meta: "Kitchen · 2 min" },
  { label: "Fold the throw blanket", meta: "Sofa · 1 min" },
  { label: "Clear one shelf", meta: "Bookcase · 5 min" },
];

export default function PhoneDemo() {
  const [done, setDone] = useState<boolean[]>(initialTasks.map(() => false));

  const doneCount = done.filter(Boolean).length;
  const pct = Math.round((doneCount / initialTasks.length) * 100);
  const allDone = doneCount === initialTasks.length;

  return (
    <div className="phone" role="group" aria-label="Interactive preview of the Inchmeal app showing today's three small tasks and a progress ring">
      <div className="screen">
        <div className="status-row">
          <span>9:41</span>
          <span className="sig"><i></i><i></i><i></i></span>
        </div>
        <div className="app-head">
          <div>
            <div className="app-eyebrow">Today · Tuesday</div>
            <div className="app-title">Three little steps<span className="dot">.</span></div>
          </div>
          <div className="ring-wrap">
            <svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">
              <circle className="ring-track" cx="31" cy="31" r="27" fill="none" strokeWidth="5" pathLength={100} strokeDasharray="100" />
              <circle
                className="ring-prog"
                cx="31"
                cy="31"
                r="27"
                fill="none"
                strokeWidth="5"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={100 - pct}
                strokeLinecap="round"
              />
            </svg>
            <span className="ring-num">{pct}%</span>
          </div>
        </div>
        <ul className="tasks" aria-label="Today's tasks, tap to try them">
          {initialTasks.map((task, i) => (
            <li key={task.label} className={`task${done[i] ? " done" : ""}`}>
              <button
                className="task-check"
                type="button"
                aria-pressed={done[i]}
                aria-label={`Mark done: ${task.label}`}
                onClick={() =>
                  setDone((prev) => prev.map((v, j) => (j === i ? !v : v)))
                }
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M2.5 7.5 5.5 10.5 11.5 3.5" />
                </svg>
              </button>
              <span className="task-text">
                <b>{task.label}</b>
                <span>{task.meta}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="task-count">
          {doneCount} of {initialTasks.length} done · no rush
        </div>
        <div className={`all-done${allDone ? " show" : ""}`}>
          That&apos;s everything for today. The rest can wait, and stopping now is fine.
        </div>
        <div className="vision-card">
          <div className="vision-thumb" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="vision-photo" src="/images/vision.png" alt="" />
          </div>
          <div className="vision-meta">
            <b>Your vision · Living room</b>
            <p>Sunday-you, sitting in a calm room.</p>
            <b style={{ marginTop: 5, marginBottom: 0 }}>12 steps total · 4 days in</b>
          </div>
        </div>
        <div className="tab-bar" aria-hidden="true"><i className="on"></i><i></i><i></i><i></i></div>
      </div>
    </div>
  );
}
