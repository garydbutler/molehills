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

const STORAGE_KEYS = {
  USER: "molehill:user",
  PROJECTS: "molehill:projects",
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

export type Project = {
  id: string;
  title: string;
  space: string;
  vision: string; // the end-state line, e.g. "Sunday-you, sitting in a calm room."
  glyph: string; // stand-in for the photo / rendered vision
  photoUri?: string; // URI of the captured "before" photo
  endStateImage?: string; // base64 of AI-generated tidy version
  createdAt: number;
  steps: Step[];
};

export type User = { name: string; email: string; provider: string };

type Store = {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
  projects: Project[];
  addProject: (p: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  toggleStep: (projectId: string, stepId: string) => void;
  hydrated: boolean;
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
    photoUri,
    createdAt: Date.now(),
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
    photoUri,
    createdAt: Date.now(),
    steps: plan.steps.map(({ label, minutes }, i) => ({
      id: `${nextId()}-${i}`,
      label,
      minutes,
      dayIndex: Math.floor(i / 3),
      done: false,
    })),
  };
}

function seedProject(): Project {
  const p = makeProject("Living room reset", "Living room");
  // Four days in: first four steps already done.
  p.steps.forEach((s, i) => {
    if (i < 4) s.done = true;
  });
  return p;
}

export function projectStats(p: Project) {
  const total = p.steps.length;
  const done = p.steps.filter((s) => s.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const daysIn = Math.max(0, Math.floor(done / 3));
  const todaySteps = p.steps.filter((s) => !s.done).slice(0, 3);
  const todayDone = 3 - todaySteps.length;
  return { total, done, pct, daysIn, todaySteps, todayDone };
}

/* ---- provider ---- */

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedProjects] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.PROJECTS),
        ]);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (storedProjects) {
          const parsed: Project[] = JSON.parse(storedProjects);
          const validated = parsed.map((p) => ({
            ...p,
            photoUri: validatePhotoUri(p.photoUri),
          }));
          setProjects(validated);
        } else {
          setProjects([seedProject()]);
        }
      } catch (e) {
        console.warn("Failed to hydrate store from AsyncStorage:", e);
        setProjects([seedProject()]);
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

  const signIn = useCallback((u: User) => setUser(u), []);
  const signOut = useCallback(() => setUser(null), []);
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

  const value = useMemo(
    () => ({ user, signIn, signOut, projects, addProject, updateProject, toggleStep, hydrated }),
    [user, signIn, signOut, projects, addProject, updateProject, toggleStep, hydrated],
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
