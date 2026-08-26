/*
  App store — prototype state: simulated auth + projects/steps on mock data.
  When the Neon-backed Next.js API lands, only this file's actions change;
  screens keep reading the same shape.
*/
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

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
  toggleStep: (projectId: string, stepId: string) => void;
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

export function makeProject(title: string, spaceKey: string): Project {
  const bp = BLUEPRINTS[spaceKey] ?? GENERIC;
  return {
    id: nextId(),
    title,
    space: bp.space,
    vision: VISIONS[bp.space] ?? VISIONS.Goal,
    glyph:
      bp.space === "Living room"
        ? "\u{1FA91}"
        : bp.space === "Desk"
          ? "\u{1F4BB}"
          : bp.space === "Garden"
            ? "\u{1F33F}"
            : bp.space === "Garage"
              ? "\u{1F6E0}\uFE0F"
              : "\u{1F3AF}",
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
  const [projects, setProjects] = useState<Project[]>(() => [seedProject()]);

  const signIn = useCallback((u: User) => setUser(u), []);
  const signOut = useCallback(() => setUser(null), []);
  const addProject = useCallback(
    (p: Project) => setProjects((prev) => [p, ...prev]),
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
    () => ({ user, signIn, signOut, projects, addProject, toggleStep }),
    [user, signIn, signOut, projects, addProject, toggleStep],
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
