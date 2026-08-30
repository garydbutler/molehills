/*
  App store — prototype state: simulated auth + projects/steps on mock data.
  When the Neon-backed Next.js API lands, only this file's actions change;
  screens keep reading the same shape.
*/
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import { clearAuthToken } from "@/lib/auth-token";

const STORAGE_KEYS = {
  USER: "molehill:user",
  PROJECTS: "molehill:projects",
  PLANS_USED: "molehill:plansUsed",
  NAME_RESPONSES: "molehill:nameResponses",
} as const;

function validatePhotoUri(uri: string | undefined): string | undefined {
  if (!uri) return undefined;
  try {
    const file = new File(uri);
    return file.exists ? uri : undefined;
  } catch {
    return undefined;
  }
}

export type Step = {
  id: string;
  label: string;
  minutes: number;
  dayIndex: number; // 0-based slice of days
  done: boolean;
};

/*
  A capture starts a PROJECT. Cleaning the kitchen, remodelling the bath, the
  job application, chapter 4 — all projects. Only one is "today"; the rest wait.
*/
export type ProjectStatus = "today" | "saved" | "paused" | "finished";

export type RecaptureVerdict =
  | "progress" // the work is there
  | "leap" // they did more than today's jobs
  | "no_change" // nothing moved, or we can't tell
  | "wrong_project"; // that's a picture of something else

export type Recapture = {
  id: string;
  day: string; // local YYYY-MM-DD
  at: number;
  photoUri?: string;
  note?: string; // what they said changed, for projects shown in words
  verdict: RecaptureVerdict;
  progress: number; // 0..1 — how filled the done picture is after this look
  message?: string;
};

/*
  How a project gets shown at the end of a day.

  "photo" — point the camera at it, as before.
  "words" — say what changed, in your own words. For work that is private
  (a dissertation, a legal filing, a therapy journal) or simply has nothing
  to photograph. We never ask for the work itself, only for what moved.
*/
export type Evidence = "photo" | "words";

export type Project = {
  id: string;
  title: string;
  space: string; // what kind of project: Kitchen, Bathroom, Essay, Homework…
  vision: string; // the end-state line, e.g. "Sunday-you, sitting in a calm room."
  glyph: string; // stand-in for the photo / rendered vision
  description?: string; // for projects started from a sentence, not a photo
  evidence: Evidence; // how this project gets shown at the end of a day
  photoUri?: string; // URI of the captured "before" photo
  endStateImage?: string; // base64 of the AI-generated done picture
  createdAt: number;
  steps: Step[];

  /* --- recapture --- */
  status: ProjectStatus;
  progress: number; // 0..1 — how far the done picture has filled in
  lastRecaptureDay?: string; // day a recapture last SUCCEEDED (day is over)
  attemptsDay?: string; // which day `attempts` counts
  attempts?: number; // recapture looks used that day (capped)
  failuresToday?: number; // consecutive unreadable looks — unlocks manual fallback
  tiredDay?: string; // day they told us they were exhausted
  recaptures?: Recapture[];
};

/* Ten looks per project per day is plenty; a stuck retry loop must not run up
   a bill. */
export const MAX_RECAPTURES_PER_DAY = 10;

/* Two failed looks and we stop trapping them — a manual "I did this" opens up. */
export const FAILURES_BEFORE_MANUAL = 2;

export function dayKey(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export type User = {
  name: string;
  email: string;
  provider: string;
  /* Stable account id from the OAuth JWT. RevenueCat keys entitlements off
     this, so a subscription follows the account, not the handset. Optional
     because the local email tester has no real one. */
  sub?: string;
};

type NameResponses = Record<string, string | null>;

/* Apple's `sub` is the stable user id that survives later authorisations
   where Apple no longer returns a name. The provider prefix prevents ids from
   different OAuth systems colliding; email is only for the local tester. */
function userIdentityKey(user: User | null): string | null {
  if (!user) return null;
  const id = user.sub?.trim() || user.email.trim().toLowerCase();
  return id ? `${user.provider}:${id}` : null;
}

type Store = {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
  projects: Project[];
  todayProject: Project | null;
  addProject: (p: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  toggleStep: (projectId: string, stepId: string) => void;
  setTodayProject: (projectId: string) => void;
  saveForLater: (projectId: string) => void;
  markTired: (projectId: string) => void;
  claimRecaptureAttempt: (projectId: string) => boolean;
  applyRecapture: (projectId: string, result: RecaptureResult) => void;
  finishToday: (projectId: string) => void;
  /* Plans generated on this install, ever. The only metered thing in the app —
     each one is a paid vision-model call. */
  plansUsed: number;
  recordPlanUsed: () => void;
  /* Everything this device holds, gone. Used by account deletion — leaving
     the projects behind would show the next person to sign in on this phone
     someone else's work. */
  wipeLocalData: () => Promise<void>;
  /* Apple hands over a name only on first authorisation, so the locally
     handled prompt is scoped to Apple's stable user id. */
  namePromptHandled: boolean;
  setDisplayName: (name: string) => void;
  skipNamePrompt: () => void;
  hydrated: boolean;
};

export type RecaptureResult = {
  verdict: RecaptureVerdict;
  progress: number; // 0..1
  completedStepIds: string[];
  photoUri?: string;
  note?: string;
  message?: string;
};

const StoreContext = createContext<Store | null>(null);

let idCounter = 0;
export const nextId = () => `s${++idCounter}-${Date.now().toString(36)}`;

/* ---- mock step generation (later: server-side vision model does this) ---- */

type Blueprint = { space: string; steps: [string, number][] };

const BLUEPRINTS: Record<string, Blueprint> = {
  "Living room": {
    space: "Living room",
    steps: [
      ["Put the mugs in the sink", 2],
      ["Fold the throw blanket", 1],
      ["Clear one shelf", 5],
      ["Bin the old mail pile", 3],
      ["Corral the cables", 4],
      ["Fluff and straighten cushions", 2],
      ["Dust the coffee table", 3],
      ["Return borrowed books to shelf", 4],
      ["Sweep under the sofa", 6],
      ["Water the plants", 3],
      ["Wipe the windowsill", 4],
      ["Light the lamp and sit down", 1],
    ],
  },
  Desk: {
    space: "Desk",
    steps: [
      ["Toss the dead pens", 1],
      ["Stack papers into one pile", 3],
      ["File or bin each paper", 5],
      ["Untangle the charger nest", 4],
      ["Wipe the surface", 2],
      ["Give everything a home", 6],
      ["Clear the monitor bezel stickers", 2],
      ["Sort the drawer of forgetting", 6],
      ["Set up the notebook stack", 3],
      ["Cable-clip the essentials", 4],
      ["Empty the mug graveyard", 2],
      ["Sit down to a clear surface", 1],
    ],
  },
  Garden: {
    space: "Garden",
    steps: [
      ["One handful of leaves", 3],
      ["Pull the obvious weeds", 5],
      ["Fill one bag of clippings", 5],
      ["Trim the path edges", 6],
      ["Water the beds", 4],
      ["Deadhead the tired flowers", 5],
      ["Stake the leaning tomatoes", 5],
      ["Sweep the patio corner", 4],
      ["Top up the bird bath", 2],
      ["Mulch around the roses", 6],
      ["Coil the hose away", 3],
      ["Stand back and admire it", 2],
    ],
  },
  Garage: {
    space: "Garage",
    steps: [
      ["Sort one box: keep", 5],
      ["Sort one box: gift", 5],
      ["Sort one box: goodbye", 5],
      ["Shelve the keepers", 6],
      ["Bag the giveaways for the car", 4],
      ["Break down the flat cardboard", 4],
      ["Find the floor, one square metre", 6],
      ["Hang the tools back on the pegboard", 5],
      ["Label the holiday boxes", 4],
      ["Sweep the doorway", 3],
      ["Park the bike properly", 3],
      ["Close the door on a job started", 1],
    ],
  },
};

const GENERIC: Blueprint = {
  space: "Goal",
  steps: [
    ["Write down what done looks like", 3],
    ["Gather what you need in one place", 5],
    ["Do the smallest visible piece", 5],
    ["Tidy yesterday's loose ends", 4],
    ["Do the next small piece", 5],
    ["Show someone your progress", 3],
    ["Fix the one thing that annoys you", 5],
    ["Do a piece you've been avoiding", 6],
    ["Ask for the help you need", 4],
    ["Finish the fiddly last details", 6],
    ["Clean up after yourself", 3],
    ["Step back — it's finished", 2],
  ],
};

const VISIONS: Record<string, string> = {
  "Living room": "Sunday-you, sitting in a calm room.",
  Desk: "A surface that thinks clearly.",
  Garden: "From jungle to sanctuary.",
  Garage: "The boxes of forgetting, sorted.",
  Goal: "It exists, and you made it.",
};

function spaceToGlyph(space: string): string {
  const lower = space.toLowerCase();
  if (lower.includes("living")) return "\u{1FA91}";
  if (lower.includes("desk") || lower.includes("office")) return "\u{1F4BB}";
  if (lower.includes("garden") || lower.includes("yard")) return "\u{1F33F}";
  if (lower.includes("garage")) return "\u{1F6E0}\uFE0F";
  if (lower.includes("kitchen")) return "\u{1F373}";
  if (lower.includes("bed")) return "\u{1F6CF}\uFE0F";
  if (lower.includes("bath")) return "\u{1F6C1}";
  return "\u{1F3AF}";
}

export function makeProject(
  title: string,
  spaceKey: string,
  photoUri?: string,
): Project {
  const bp = BLUEPRINTS[spaceKey] ?? GENERIC;
  return {
    id: nextId(),
    title,
    space: bp.space,
    vision: VISIONS[bp.space] ?? VISIONS.Goal,
    glyph: spaceToGlyph(bp.space),
    // Start as you began: a photo project ends its days in photos, a project
    // started from a sentence ends them in sentences. Overridable at capture.
    evidence: photoUri ? "photo" : "words",
    photoUri,
    createdAt: Date.now(),
    status: "saved",
    progress: 0,
    steps: bp.steps.map(([label, minutes], i) => ({
      id: `${nextId()}-${i}`,
      label,
      minutes,
      dayIndex: Math.floor(i / 3),
      done: false,
    })),
  };
}

export type ApiPlanStep = { label: string; minutes: number };

export type ApiPlan = {
  title: string;
  space: string;
  vision: string;
  steps: ApiPlanStep[];
};

export function makeProjectFromPlan(plan: ApiPlan, photoUri?: string): Project {
  return {
    id: nextId(),
    title: plan.title,
    space: plan.space,
    vision: plan.vision,
    glyph: spaceToGlyph(plan.space),
    evidence: photoUri ? "photo" : "words",
    photoUri,
    createdAt: Date.now(),
    status: "saved",
    progress: 0,
    steps: plan.steps.map(({ label, minutes }, i) => ({
      id: `${nextId()}-${i}`,
      label,
      minutes,
      dayIndex: Math.floor(i / 3),
      done: false,
    })),
  };
}

export function projectStats(p: Project) {
  const total = p.steps.length;
  const done = p.steps.filter((s) => s.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const today = dayKey();

  // Days in = days they actually showed us the work, not days elapsed.
  const daysIn = (p.recaptures ?? []).filter(
    (r) => r.verdict === "progress" || r.verdict === "leap",
  ).length;

  const remaining = p.steps.filter((s) => !s.done);
  const restingUntilTomorrow = p.lastRecaptureDay === today;
  const tired = p.tiredDay === today;

  // A tired day gets ONE job — the smallest real one, never an invented
  // thirty-second job.
  const offered = tired
    ? [...remaining].sort((a, b) => a.minutes - b.minutes).slice(0, 1)
    : remaining.slice(0, 3);

  const todaySteps = restingUntilTomorrow ? [] : offered;
  const todayMinutes = todaySteps.reduce((sum, s) => sum + s.minutes, 0);
  const attemptsToday = p.attemptsDay === today ? (p.attempts ?? 0) : 0;

  return {
    total,
    done,
    pct,
    daysIn,
    todaySteps,
    todayDone: Math.max(0, (tired ? 1 : 3) - todaySteps.length),
    todayMinutes,
    tired,
    restingUntilTomorrow,
    complete: remaining.length === 0,
    attemptsToday,
    attemptsLeft: Math.max(0, MAX_RECAPTURES_PER_DAY - attemptsToday),
    canRecapture: attemptsToday < MAX_RECAPTURES_PER_DAY,
    manualFallbackUnlocked:
      (p.failuresToday ?? 0) >= FAILURES_BEFORE_MANUAL,
  };
}

/* ---- provider ---- */

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [plansUsed, setPlansUsed] = useState(0);
  const [nameResponses, setNameResponses] = useState<NameResponses>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedProjects, storedPlansUsed, storedNameResponses] =
          await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.PROJECTS),
          AsyncStorage.getItem(STORAGE_KEYS.PLANS_USED),
          AsyncStorage.getItem(STORAGE_KEYS.NAME_RESPONSES),
        ]);

        const responses: NameResponses = storedNameResponses
          ? JSON.parse(storedNameResponses)
          : {};
        setNameResponses(responses);

        if (storedUser) {
          const parsedUser: User | null = JSON.parse(storedUser);
          const key = userIdentityKey(parsedUser);
          const savedName = key ? responses[key] : undefined;
          setUser(
            parsedUser && typeof savedName === "string"
              ? { ...parsedUser, name: savedName }
              : parsedUser,
          );
        }

        const used = Number(storedPlansUsed);
        if (Number.isFinite(used) && used > 0) setPlansUsed(used);

        if (storedProjects) {
          const parsed: Project[] = JSON.parse(storedProjects);
          const validated = parsed.map((p) => ({
            ...p,
            photoUri: validatePhotoUri(p.photoUri),
            // Projects stored before recapture landed have no status/progress.
            status: p.status ?? "saved",
            progress: p.progress ?? 0,
            // Projects stored before evidence landed were all photo projects.
            evidence: p.evidence ?? (p.photoUri ? "photo" : "words"),
          }));
          // Exactly one project holds "today".
          if (validated.length > 0 && !validated.some((p) => p.status === "today")) {
            const next =
              validated.find((p) => p.status !== "finished") ?? validated[0];
            next.status = "today";
          }
          setProjects(validated);
        } else {
          setProjects([]);
        }
      } catch (e) {
        console.warn("Failed to hydrate store from AsyncStorage:", e);
        setProjects([]);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)).catch((e) =>
      console.warn("Failed to persist user:", e),
    );
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects)).catch(
      (e) => console.warn("Failed to persist projects:", e),
    );
  }, [projects, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEYS.PLANS_USED, String(plansUsed)).catch((e) =>
      console.warn("Failed to persist plansUsed:", e),
    );
  }, [plansUsed, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEYS.NAME_RESPONSES,
      JSON.stringify(nameResponses),
    ).catch((e) => console.warn("Failed to persist name responses:", e));
  }, [nameResponses, hydrated]);

  const signIn = useCallback(
    (u: User) => {
      const key = userIdentityKey(u);
      const savedName = key ? nameResponses[key] : undefined;
      setUser(typeof savedName === "string" ? { ...u, name: savedName } : u);
    },
    [nameResponses],
  );
  const recordPlanUsed = useCallback(() => setPlansUsed((n) => n + 1), []);

  const namePromptHandled = useMemo(() => {
    const key = userIdentityKey(user);
    return Boolean(
      key && Object.prototype.hasOwnProperty.call(nameResponses, key),
    );
  }, [nameResponses, user]);

  const setDisplayName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      const key = userIdentityKey(user);
      if (!trimmed || !key) return;
      setUser((u) => (u ? { ...u, name: trimmed } : u));
      setNameResponses((responses) => ({ ...responses, [key]: trimmed }));
    },
    [user],
  );

  /* Skipping is a real answer. We never ask again — being nagged for a name
     by a tool that promises no guilt would be its own small betrayal. */
  const skipNamePrompt = useCallback(() => {
    const key = userIdentityKey(user);
    if (!key) return;
    setNameResponses((responses) => ({ ...responses, [key]: null }));
  }, [user]);
  const wipeLocalData = useCallback(async () => {
    setUser(null);
    setProjects([]);
    setPlansUsed(0);
    setNameResponses({});
    await clearAuthToken();
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER,
      STORAGE_KEYS.PROJECTS,
      STORAGE_KEYS.PLANS_USED,
      STORAGE_KEYS.NAME_RESPONSES,
    ]).catch((e) => console.warn("Failed to clear local data:", e));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    // Leaving the token behind would keep the API callable after sign out.
    clearAuthToken();
  }, []);
  const addProject = useCallback(
    (p: Project) => setProjects((prev) => [p, ...prev]),
    [],
  );
  const updateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id !== projectId ? p : { ...p, ...updates })),
      );
    },
    [],
  );
  const toggleStep = useCallback((projectId: string, stepId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id !== projectId
          ? p
          : {
              ...p,
              steps: p.steps.map((s) =>
                s.id === stepId ? { ...s, done: !s.done } : s,
              ),
            },
      ),
    );
  }, []);

  /* Only one project is "today". Promoting one pauses whoever held it —
     leftover jobs stay put, nothing is deleted. */
  const setTodayProject = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) return { ...p, status: "today" as const };
        if (p.status === "today") return { ...p, status: "paused" as const };
        return p;
      }),
    );
  }, []);

  const saveForLater = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: "saved" as const } : p,
      ),
    );
  }, []);

  const markTired = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, tiredDay: dayKey() } : p)),
    );
  }, []);

  /* Returns false when today's looks are spent, so a retry loop can't bill. */
  const claimRecaptureAttempt = useCallback((projectId: string) => {
    const today = dayKey();
    let allowed = false;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const used = p.attemptsDay === today ? (p.attempts ?? 0) : 0;
        if (used >= MAX_RECAPTURES_PER_DAY) return p;
        allowed = true;
        return { ...p, attemptsDay: today, attempts: used + 1 };
      }),
    );
    return allowed;
  }, []);

  const applyRecapture = useCallback(
    (projectId: string, result: RecaptureResult) => {
      const today = dayKey();
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;

          const moved =
            result.verdict === "progress" || result.verdict === "leap";

          const entry: Recapture = {
            id: nextId(),
            day: today,
            at: Date.now(),
            photoUri: result.photoUri,
            note: result.note,
            verdict: result.verdict,
            progress: result.progress,
            message: result.message,
          };

          const steps = moved
            ? p.steps.map((s) =>
                result.completedStepIds.includes(s.id) ? { ...s, done: true } : s,
              )
            : p.steps;

          const allDone = steps.every((s) => s.done);

          return {
            ...p,
            steps,
            // The done picture only ever fills in — a bad photo never takes
            // ground back.
            progress: moved ? Math.max(p.progress ?? 0, result.progress) : (p.progress ?? 0),
            // A failed look does NOT end the day; they can try again.
            lastRecaptureDay: moved ? today : p.lastRecaptureDay,
            failuresToday: moved ? 0 : (p.failuresToday ?? 0) + 1,
            status: allDone ? ("finished" as const) : p.status,
            recaptures: [...(p.recaptures ?? []), entry],
          };
        }),
      );
    },
    [],
  );

  /* Manual fallback — only reachable after repeated unreadable looks. */
  const finishToday = useCallback((projectId: string) => {
    const today = dayKey();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const stats = projectStats(p);
        const ids = stats.todaySteps.map((s) => s.id);
        const steps = p.steps.map((s) =>
          ids.includes(s.id) ? { ...s, done: true } : s,
        );
        const allDone = steps.every((s) => s.done);
        return {
          ...p,
          steps,
          lastRecaptureDay: today,
          failuresToday: 0,
          progress: Math.max(
            p.progress ?? 0,
            steps.filter((s) => s.done).length / Math.max(1, steps.length),
          ),
          status: allDone ? ("finished" as const) : p.status,
        };
      }),
    );
  }, []);

  const todayProject = useMemo(
    () => projects.find((p) => p.status === "today") ?? null,
    [projects],
  );

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      projects,
      todayProject,
      addProject,
      updateProject,
      toggleStep,
      setTodayProject,
      saveForLater,
      markTired,
      claimRecaptureAttempt,
      applyRecapture,
      finishToday,
      plansUsed,
      recordPlanUsed,
      wipeLocalData,
      namePromptHandled,
      setDisplayName,
      skipNamePrompt,
      hydrated,
    }),
    [
      user,
      signIn,
      signOut,
      projects,
      todayProject,
      addProject,
      updateProject,
      toggleStep,
      setTodayProject,
      saveForLater,
      markTired,
      claimRecaptureAttempt,
      applyRecapture,
      finishToday,
      plansUsed,
      recordPlanUsed,
      wipeLocalData,
      namePromptHandled,
      setDisplayName,
      skipNamePrompt,
      hydrated,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
