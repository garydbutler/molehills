# Inchmeal garage E2E — issues report

Tested: 2026-08-30  
Scenario: **Clear Garage Floor Space**, a 12-step, four-day garage-clearance project on iPhone 17 Pro Simulator.

## Open issues

### P0 — AI feedback can contradict visible progress and shame the user

**Observed:** A Day 3 photo showed the loose tools put away, the bicycle moved flush to the wall, and a clearer floor. The feedback record was assessed as `visible_progress`, but the shown message said: “It looks like the floor is still quite cluttered, but take a deep breath and let's try again tomorrow.”

**Why it matters:** This directly contradicts both the visual result and the app's non-shaming promise. It can undermine trust at the product's most emotionally sensitive moment.

**Likely cause:** The model's structured assessment and its display message are returned together but are not validated for agreement. The route already instructs the model not to imply the work did not happen ([recapture route](/Users/gary/Development/projects/molehills/web/src/app/api/recapture/route.ts:35)).

**Resolution direction:** Derive message rules from the assessment server-side or reject/regenerate contradictory pairs. Add tests for visible progress, ambiguous progress, and no visible change.

### P1 — Later same-day completion batches do not require a checkpoint

**Observed:** Day 1's final task opened a checkpoint. After the first log that day, Day 2's final task did not; it left logging as a manually discovered action on Journey/Vision.

**Why it matters:** The photo/note is core evidence of progress. A later batch is easier to complete without a log, despite being equally meaningful.

**Resolution direction:** Decide whether every completed daily batch must create a checkpoint. If yes, remove the condition that suppresses it after the first log of the calendar day and add an E2E case for two batches in one day.

### P1 — Three-jobs-per-day guardrail differs between Today and Vision

**Observed:** Today prevented more work after three jobs and displayed “Done for today.” Vision allowed all twelve jobs to be completed immediately.

**Why it matters:** The product gives mutually incompatible rules depending on where the user taps. In a real single-day test, this also makes the intended four-day journey impossible to exercise faithfully without changing the host date.

**Evidence:** Vision task rows remain active in [vision/[id].tsx](/Users/gary/Development/projects/molehills/mobile/src/app/vision/[id].tsx:230).

**Resolution direction:** Put the scheduling/eligibility rule in the store action, then render that one rule consistently in both tabs. If Vision is intentionally an override, label it clearly and confirm the consequence.

### P1 — Today offers no way to log already-completed progress

**Observed:** Once Today shows its end-of-day state, it offers “See the vision” but not a photo/note checkpoint, even when completed work remains unlogged.

**Why it matters:** Users should not have to discover a second screen to preserve progress.

**Resolution direction:** Add the same pending-checkpoint / “Log today's progress” affordance that exists on Vision and Journey ([vision/[id].tsx](/Users/gary/Development/projects/molehills/mobile/src/app/vision/[id].tsx:201)).

### P2 — Today does not show user progress photos

**Observed:** Today blends the original photo with the generated end state instead of surfacing the real checkpoint photos the user took.

**Why it matters:** The main daily screen hides the most credible evidence of change, while Journey's before/after view shows it.

**Evidence:** [today.tsx](/Users/gary/Development/projects/molehills/mobile/src/app/(tabs)/today.tsx:167) feeds `DonePicture` the project original and generated end state.

**Resolution direction:** Show the latest user checkpoint photo on Today, or provide a clear route to the timeline/comparator from the hero.

### P2 — Content can scroll beneath the status bar and Dynamic Island

**Observed:** Vision, Today, and checkpoint screens can render headlines/progress beneath the iPhone status area.

**Why it matters:** Key content is partially obscured on the primary device size.

**Resolution direction:** Apply safe-area insets consistently to every scrolling screen and add a visual regression check for iPhone 17 Pro.

### P2 — Before and progress photos use inconsistent framing

**Observed:** Initial capture uses a 4:3 edit/crop, while the checkpoint photo-library picker does not. The comparator can therefore show mismatched aspect ratios side by side.

**Evidence:** The checkpoint picker invokes `launchImageLibraryAsync` without editing/cropping in [recapture/[id].tsx](/Users/gary/Development/projects/molehills/mobile/src/app/recapture/[id].tsx:82).

**Resolution direction:** Use a consistent crop policy for both capture flows, or normalize images at display time with explicit framing guidance.

### P2 — Photo-library permission uses the old product name

**Observed:** iOS displayed “Allow Molehill to access your photos” while the app itself is titled Inchmeal.

**Why it matters:** It looks unpolished and may create user trust or App Review concerns.

**Resolution direction:** Update `NSPhotoLibraryUsageDescription` in the source configuration and rebuild a fresh iOS prebuild to verify the native string.

### P3 — Generated end-state MIME type is hard-coded as PNG

**Observed:** The end-state bytes were JPEG (JFIF header), but the client constructs a `data:image/png;base64,...` URI.

**Why it matters:** It happens to render in the test, but is technically incorrect and brittle.

**Evidence:** [today.tsx](/Users/gary/Development/projects/molehills/mobile/src/app/(tabs)/today.tsx:173).

**Resolution direction:** Persist and use the API-provided MIME type, with a safe default only when unavailable.

### P3 — Journey's optional log action is visually easy to miss

**Observed:** Journey renders the log action as plain green text, while Vision uses a bordered button.

**Why it matters:** The test showed that users may need this route after an unprompted batch; its low affordance makes that recovery path harder to find.

**Evidence:** [journey.tsx](/Users/gary/Development/projects/molehills/mobile/src/app/(tabs)/journey.tsx:114).

**Resolution direction:** Use a consistent button treatment and make the checkpoint state visually prominent.

## Resolved during this test

### P0 — Project completion crashed when Journey rendered a finished project

**Observed:** Submitting the final photo changed the project to finished, then Expo Router threw because an array style was passed through `Link asChild` to a `Slot`. The final log did not persist while the render failed.

**Resolution:** Flattened the composed style before passing it to `Card` in [journey.tsx](/Users/gary/Development/projects/molehills/mobile/src/app/(tabs)/journey.tsx:145).

**Verification:** Typecheck and Expo lint pass. The final checkpoint saved, the completion screen rendered, and “See the journey” opened a stable 100% finished-project view.

## Test notes

- The server permits only three AI feedback calls per day. The fourth and fifth checkpoints saved successfully but used the intended warm local fallback instead of visual AI feedback.
- A displayed “5 days in” count resulted after four planned days plus an optional Journey log. Confirm whether optional logs should count as project visits/days; if not, treat this as an additional P2 reporting bug.
