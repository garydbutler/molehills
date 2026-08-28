/*
  One runnable check for the recapture route's two ways of showing a day:
  a photo, or a sentence about what changed.

  Needs a dev server up (npm run dev). No API key required — every case here
  is answered by validation, before the model is ever called.

    node scripts/check-recapture.mjs [baseUrl]
*/
import assert from "node:assert/strict";

const BASE = process.argv[2] ?? "http://localhost:3000";

const post = async (body) => {
  const res = await fetch(`${BASE}/api/recapture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

const jobs = { todayJobs: ["Write one ugly paragraph"], remainingJobs: [] };

// Neither photo nor sentence — there is nothing to judge.
const empty = await post({ ...jobs });
assert.equal(empty.status, 400, `no evidence should be 400, got ${empty.status}`);

// Whitespace is not a sentence.
const blank = await post({ ...jobs, note: "   \n  " });
assert.equal(blank.status, 400, `blank note should be 400, got ${blank.status}`);

// A real sentence gets past validation — 503 (no key) or 502/200 (key) all
// prove the words path is reachable without an image.
const words = await post({ ...jobs, note: "Got the intro rewritten." });
assert.notEqual(words.status, 400, "a real note must not be rejected as missing evidence");

// The photo path must still work with no note at all.
const photo = await post({ ...jobs, nowImage: "data:image/jpeg;base64,/9j/4AAQSkZJRg==" });
assert.notEqual(photo.status, 400, "an image must not be rejected as missing evidence");

console.log("recapture: ok — words and photo paths both reachable, empty rejected");
console.log(`  (note path returned ${words.status}, photo path ${photo.status})`);
