# Inchmeal end-to-end test — handoff

Single-case E2E run on the iPhone 17 Pro simulator, starting from the messy-garage
photo. Paused at 92% (11 of 12 jobs). This doc is everything needed to resume.

Date paused: 2026-08-30, ~20:50 local.

---

## Where the test stands

Project: **Clear Garage Floor Space** (space: `Garage`)
Vision: *"A clear, open floor where you can easily walk to your car or workbench without tripping."*

- **11 of 12 jobs done**, progress 92%, status `today`
- **`completedSinceLog: 2`** — two ticked jobs are not yet logged
- **Remaining job (deliberately reserved):** Day 4 — *"Use a dustpan to pick up all
  sweepings and dispose of them in the trash"* (5 min)
- **3 progress logs saved**, all with photos, all with real AI feedback

### The immediate next step

I was mid-way through the **intermediate journey check-in** when we paused:

1. Journey tab → **"Log today's progress · 2 jobs"** → photo picker is open
2. Pick `journey-extra.png` (see *Picking the right photo* below) → **Save progress**
3. Then tick the final dustpan job → this should fire the **project-completion
   checkpoint** (`kind: "project"`) → attach `day4.png` → **Finish check-in**
4. Expect the finished state: *"Clear Garage Floor Space is finished."*

That last step is the one part of the flow never yet exercised — project completion.

---

## Photos

All in `docs/e2e-garage-test/`. Copied out of the session scratchpad, which is
session-scoped and will be gone.

| File | State | Role |
|---|---|---|
| `before-cropped.png` | original clutter, 1202×801 | start state, as the app stored it after its 4:3 crop |
| `day1.png` | cord hung, boxes gone, ball in bin; trash bags remain | Day 1 check-in ✅ used |
| `day2.png` | bags gone, bin sorted, bench grouped; toolbox on floor | Day 2 check-in ✅ used |
| `day3.png` | tools away, bike flush, shelves squared; floor dusty | Day 3 check-in ✅ used |
| `journey-extra.png` | floor clear, single bike, not yet swept clean | **intermediate — not yet used** |
| `day4.png` | floor clean | **final — not yet used** |
| `end-state.png` | AI-generated target, 1264×842 | generated on the vision screen |

### Picking the right photo in the simulator

The picker is **not** ordered by when `simctl addmedia` ran — I selected the top-left
thumbnail expecting the newest and got `day2.png` instead. Identify by content:

- `journey-extra.png` — **one** bike leaning on the shelves, completely clear floor,
  orange cord coiled on the right wall, yellow bin by the door. Floor clear but dusty.
- `day4.png` — same framing, floor visibly swept clean.

To load one: `xcrun simctl addmedia <UDID> docs/e2e-garage-test/journey-extra.png`

---

## Environment — read this before rebuilding

The simulator is `iPhone 17 Pro`, UDID `E3E2BDAD-4512-426E-97CB-135F70858AC2`.
App bundle id `app.inchmeal.mobile`. Metro is `npx expo start --dev-client`.

**`mobile/ios/` is a stale prebuild and is gitignored.** Three workarounds are load-bearing:

1. **Wrong bundle id.** The checked-out `ios/` still says `app.molehills.mobile`
   while `app.json` says `app.inchmeal.mobile`. A plain `expo run:ios` builds a
   *separate app*; `simctl install` reports success and changes nothing. I built with:

   ```
   cd mobile/ios && xcodebuild -workspace Squirrelz.xcworkspace -scheme Squirrelz \
     -configuration Debug -destination "id=E3E2BDAD-4512-426E-97CB-135F70858AC2" \
     -derivedDataPath build/CC PRODUCT_BUNDLE_IDENTIFIER=app.inchmeal.mobile
   ```

2. **Missing Apple sign-in entitlement.** `app.json` sets `usesAppleSignIn: true`, but
   the stale prebuild's `ios/Squirrelz/Squirrelz.entitlements` was an empty `<dict/>`,
   so `signInAsync` threw and the app showed "Could not complete sign-in". I added
   `com.apple.developer.applesignin` to that file by hand.

3. **CocoaPods needs a UTF-8 locale** in a non-interactive shell or `pod install` dies
   with `Encoding::CompatibilityError`. Prefix with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`.

**The real fix for all three is `npx expo prebuild --clean -p ios`.** I did not run it
to avoid a long rebuild mid-test. EAS prebuilds fresh, so shipped builds are likely
unaffected — this is a local-only artifact.

Also note: re-signing changes app identity, so `simctl install` demands an
uninstall/reinstall, which **wipes the data container and signs you out** (the token
lives in SecureStore; `molehill:user` in AsyncStorage survives, so the UI still greets
you by name while actually being signed out). Sign-in with Apple needs an Apple ID
signed into the simulator — that one is already done.

### Reading app state without the UI

```
D=E3E2BDAD-4512-426E-97CB-135F70858AC2
C=$(xcrun simctl get_app_container $D app.inchmeal.mobile data)
ls "$C/Library/Application Support/app.inchmeal.mobile/RCTAsyncLocalStorage_V1"
```

`manifest.json` holds small keys; large values (the projects array, which carries the
base64 end-state image) spill into a hash-named sibling file. Feedback text is stored
under `message`, not `feedback`.

---

## Findings

### 1. AI feedback contradicted itself and shamed the user — highest priority

The Day 3 check-in stored `verdict: "progress"` (model said `visible_progress`) with
this message:

> *"It looks like the floor is still quite cluttered, but take a deep breath and let's
> try again tomorrow."*

The photo showed tools cleared, the bike flush to the wall, and a visibly emptier floor.
Two problems: the message contradicts the model's own positive assessment, and it
violates the route's own instruction never to "imply that the work did not happen"
([`web/src/app/api/recapture/route.ts:37`](../../web/src/app/api/recapture/route.ts)).
Both fields come from one call with nothing constraining them to agree. For an
ADHD-focused product whose premise is "never shaming", this is the worst possible
failure mode. Days 1 and 2 produced accurate, specific, encouraging feedback, so it is
intermittent rather than systematic.

### 2. Completing a day's jobs does not always prompt for the photo

Day 1's third tick auto-opened the checkpoint. Day 2's did not — `checkpointAfterStep`
suppresses the prompt once `alreadyLoggedToday` is true. So any second batch in the
same day completes silently and the user must find "Log today's progress" themselves.
The evidence capture is the core product loop; making it opt-in for later batches is
how it gets skipped.

### 3. The three-a-day guardrail is enforced inconsistently

Today refuses to release the next day's jobs on the same calendar day ("Done for today.
The rest waits for tomorrow.") — verified at 33%, 58%, and 92%. But the vision screen
has no gate at all: `toggleStep` has no day check and the rows have no `disabled`, so
all 12 jobs can be ticked in one sitting. The product's central promise holds on one
screen and not the other.

**Consequence for testing:** a faithful 4-day simulation is impossible from Today in a
single session. `simctl` cannot set a simulator date independently — it inherits the
host clock — so the only faithful option is changing the Mac's system clock between
days. I did not do that. Everything past Day 1 was driven from the vision screen, which
is the sanctioned same-day path (the Day 1 outcome card's "Keep going" leads there).

### 4. Today has no way to log progress

"Log today's progress" exists on the vision screen
([`vision/[id].tsx:218`](../../mobile/src/app/vision/[id].tsx)) and on Journey
([`(tabs)/journey.tsx:114`](../../mobile/src/app/(tabs)/journey.tsx)), both gated on
`completedSinceLog > 0`. Today has no equivalent — once it says "That's everything for
today" it offers only "See the vision", even with unlogged work sitting there.

### 5. Today never shows the user's own progress photos

Today's hero is a blend of the *original* photo and the *AI-generated* end state, driven
by percent complete ([`(tabs)/today.tsx:167-173`](../../mobile/src/app/(tabs)/today.tsx)).
The check-in photos the user worked to capture never appear on the main screen. Journey's
before/after comparator does use them, and it is the more compelling artifact.

### 6. Content collides with the status bar — visual, reproducible

The vision, Today, and recapture scroll views have no top safe-area inset. Headlines and
the progress ring scroll under the clock and Dynamic Island and are unreadable. Seen on
every scrolling screen; the most obvious visual defect in the app.

### 7. Before/after photos are framed inconsistently

Capture crops to 4:3 via `allowsEditing`; recapture's picker does not crop at all. So
"LAST LOOK" is 4:3 and the new photo is the raw aspect, side by side in the same card.

### 8. Stale brand string in the photo permission prompt

iOS shows "Allow **Molehill** to access your photos" under an "Inchmeal" title. That is
`NSPhotoLibraryUsageDescription`, it is user-visible, and App Store review reads it.

### 9. End-state image MIME is hardcoded wrong

[`(tabs)/today.tsx:173`](../../mobile/src/app/(tabs)/today.tsx) builds
`data:image/png;base64,…` but the bytes are JPEG (verified JFIF header). It renders, but
the API returns a `mimeType` that is being ignored.

### 10. Journey's log-progress link has no button affordance

On Journey it is plain green text under a "TODAY'S PROJECT" kicker; on the vision screen
the same action is a bordered pill. Easy to miss.

### Not bugs — checked and cleared

- **Taps that "did nothing"** were scroll momentum swallowing a tap issued immediately
  after a swipe. Tapping again without an intervening swipe always worked. No hit-target
  problem.
- **Empty `feedback` field** in storage: the key is `message`. Text persists correctly.

---

## Quotas worth knowing

- Plans: 3 lifetime free per account, 12 per 30 days for pro (`web/src/lib/quota.ts`).
  This run used one.
- End-state generation: 3 attempts per project, server-enforced.
- Recaptures: client cap 10/day; the **server** caps AI feedback at 3/day, after which
  `feedbackWithFallback` degrades to a local message and the check-in still saves. All
  three logs so far came back `feedbackSource: "ai"`, so the next one may be the first
  to hit the fallback — worth watching, since it changes what the completion screen says.
