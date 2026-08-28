/*
  Recapture — "show me the project again". This is how a day ends. Not a
  checkbox: a second look at the actual work.

  A checkbox believes you meant to do it. This doesn't.

  Two ways to show it, decided per project at capture:
    - photo: point the camera at it again
    - words: say what changed, in your own words

  The words path is for work that can't be photographed, which is usually
  also the private work. It asks what moved — never for the work itself.
*/
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  Field,
  Headline,
  Kicker,
  PrimaryButton,
  SerifEm,
} from "@/components/ui";
import {
  MAX_RECAPTURES_PER_DAY,
  projectStats,
  useStore,
  type RecaptureVerdict,
} from "@/store/app-store";
import { copyToDurableStorage } from "@/lib/photos";
import { fetchRecapture } from "@/lib/api";
import { tell } from "@/lib/dialog";

/* Matches the server's cap. A sentence about the work, never the work. */
const MAX_NOTE_CHARS = 600;

type Outcome = {
  verdict: RecaptureVerdict;
  message: string;
  creditedCount: number;
};

export default function Recapture() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    projects,
    claimRecaptureAttempt,
    applyRecapture,
    finishToday,
  } = useStore();

  const [looking, setLooking] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [note, setNote] = useState("");

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <View style={styles.page}>
        <Kicker>Project not found</Kicker>
      </View>
    );
  }

  const stats = projectStats(project);
  const inWords = project.evidence === "words";

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/today");

  /* Everything past "we have the evidence in hand" is the same either way. */
  const submit = async (shown: { nowUri?: string; note?: string }) => {
    // Claim the attempt before spending a call — a stuck retry loop must not
    // be able to run up a bill.
    if (!claimRecaptureAttempt(project.id)) {
      tell("That's plenty of looks for today", "Come back tomorrow.");
      return;
    }

    setLooking(true);
    try {
      const todayJobs = stats.todaySteps;
      const remainingJobs = project.steps.filter(
        (s) => !s.done && !todayJobs.some((t) => t.id === s.id),
      );

      const res = await fetchRecapture({
        nowPhotoUri: shown.nowUri,
        note: shown.note,
        beforePhotoUri: project.photoUri,
        title: project.title,
        vision: project.vision,
        description: project.description,
        todayJobs: todayJobs.map((s) => s.label),
        remainingJobs: remainingJobs.map((s) => s.label),
      });

      // Indices come back against [today's jobs, then the rest] — same order
      // we sent them.
      const ordered = [...todayJobs, ...remainingJobs];
      const credited = res.completedJobs
        .map((i) => ordered[i])
        .filter((s) => s !== undefined);

      const moved = res.verdict === "progress" || res.verdict === "leap";

      applyRecapture(project.id, {
        verdict: res.verdict,
        // Trust what we can see: a leap skips ahead rather than making them
        // redo work already visible.
        progress: res.progress / 100,
        completedStepIds: moved
          ? (credited.length > 0 ? credited : todayJobs).map((s) => s.id)
          : [],
        photoUri: shown.nowUri,
        note: shown.note,
        message: res.message,
      });

      setOutcome({
        verdict: res.verdict,
        message: res.message,
        creditedCount: moved
          ? credited.length > 0
            ? credited.length
            : todayJobs.length
          : 0,
      });
    } catch (err) {
      console.warn("Recapture failed:", err);
      tell(
        "Couldn't look just now",
        "That's on us, not you. Try again in a moment.",
      );
    } finally {
      setLooking(false);
    }
  };

  const look = async (pick: "camera" | "library") => {
    if (!stats.canRecapture) {
      tell(
        "That's plenty of looks for today",
        "Come back tomorrow — the jobs will still be here, and so will you.",
      );
      return;
    }

    const permission =
      pick === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      tell(
        "Permission needed",
        "Molehill needs access to show the project again.",
      );
      return;
    }

    const result =
      pick === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
          });

    if (result.canceled || !result.assets[0]) return;

    let nowUri = result.assets[0].uri;
    try {
      nowUri = await copyToDurableStorage(nowUri);
    } catch {
      // Keep the temp uri; the look still works, it just may not persist.
    }

    await submit({ nowUri });
  };

  const sayIt = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;

    if (!stats.canRecapture) {
      tell(
        "That's plenty of looks for today",
        "Come back tomorrow — the jobs will still be here, and so will you.",
      );
      return;
    }

    await submit({ note: trimmed });
  };

  /* ---- after the look ---- */
  if (outcome) {
    const good = outcome.verdict === "progress" || outcome.verdict === "leap";
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
        <Pressable onPress={goBack} style={styles.back}>
          <Text style={styles.backLabel}>← Back</Text>
        </Pressable>

        <Card style={styles.outcomeCard}>
          <Text style={styles.outcomeGlyph}>
            {outcome.verdict === "leap"
              ? "✴"
              : outcome.verdict === "progress"
                ? "❋"
                : outcome.verdict === "wrong_project"
                  ? "❓"
                  : "○"}
          </Text>

          <Text style={styles.outcomeTitle}>
            {outcome.verdict === "leap"
              ? "You did more than we asked."
              : outcome.verdict === "progress"
                ? "That's the day, done."
                : outcome.verdict === "wrong_project"
                  ? "That looks like something else."
                  : inWords
                    ? "Tell me one more thing."
                    : "We can't quite see it yet."}
          </Text>

          {outcome.message ? (
            <Text style={styles.outcomeBody}>{outcome.message}</Text>
          ) : null}

          {good ? (
            <Text style={styles.outcomeMeta}>
              {outcome.creditedCount}{" "}
              {outcome.creditedCount === 1 ? "job" : "jobs"} marked done · the
              done picture moved
            </Text>
          ) : null}

          {good ? (
            <PrimaryButton label="Rest now" onPress={goBack} />
          ) : (
            <>
              <PrimaryButton
                label={inWords ? "Add a detail" : "Show it again"}
                variant="outline"
                onPress={() => setOutcome(null)}
              />
              <Pressable onPress={goBack} hitSlop={8}>
                <Text style={styles.laterLink}>Come back later</Text>
              </Pressable>
            </>
          )}
        </Card>

        {!good && stats.manualFallbackUnlocked ? (
          <Card style={styles.fallbackCard}>
            <Text style={styles.fallbackTitle}>
              {inWords ? "Words not landing?" : "Camera not cooperating?"}
            </Text>
            <Text style={styles.fallbackBody}>
              {inWords
                ? "Twice now we couldn't line up what you wrote with today's jobs. You shouldn't be stuck on phrasing — tell us it's done and we'll believe you."
                : "Twice now we couldn't read the picture. You shouldn't be stuck because the light is bad — tell us it's done and we'll believe you."}
            </Text>
            <Pressable
              onPress={() => {
                finishToday(project.id);
                goBack();
              }}
              hitSlop={8}
            >
              <Text style={styles.fallbackLink}>I did this →</Text>
            </Pressable>
          </Card>
        ) : null}
      </ScrollView>
    );
  }

  /* ---- asking for the look ---- */
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
      <Pressable onPress={goBack} style={styles.back}>
        <Text style={styles.backLabel}>← Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Kicker>Show your work</Kicker>
        <Headline>
          {inWords ? (
            <>
              What <SerifEm>moved</SerifEm>?
            </>
          ) : (
            <>
              Show it to me <SerifEm>again</SerifEm>.
            </>
          )}
        </Headline>
        <Text style={styles.lead}>
          {inWords
            ? `Not a checkbox — just tell me what changed on ${project.title.toLowerCase()} today.`
            : `Not a checkbox — just point the camera at ${project.title.toLowerCase()} one more time.`}
        </Text>
      </View>

      {!inWords && project.photoUri ? (
        <Card style={styles.guideCard}>
          <Text style={styles.guideLabel}>
            THIS IS HOW IT LOOKED — ROUGHLY MATCH IT
          </Text>
          <Image source={{ uri: project.photoUri }} style={styles.guide} />
          <Text style={styles.guideHint}>
            A foot to the left is fine. We&apos;re looking at the work, not
            the framing.
          </Text>
        </Card>
      ) : null}

      {looking ? (
        <Card style={styles.lookingCard}>
          <ActivityIndicator size="small" color={colors.accentInk} />
          <Text style={styles.lookingText}>
            {inWords ? "Reading that…" : "Having a look…"}
          </Text>
        </Card>
      ) : inWords ? (
        <View style={styles.actions}>
          <Field
            placeholder="e.g. Got the intro rewritten and pulled the two citations I was missing"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={MAX_NOTE_CHARS}
          />
          <Text style={styles.privacyNote}>
            One specific sentence is plenty. Don&apos;t paste the work itself —
            we never need to see it, only what moved.
          </Text>
          <PrimaryButton
            label="That's my day"
            onPress={sayIt}
            disabled={note.trim().length === 0}
          />
        </View>
      ) : (
        <View style={styles.actions}>
          <PrimaryButton
            label="Take the photo"
            onPress={() => look("camera")}
          />
          <PrimaryButton
            label="Pick a screenshot or photo"
            variant="outline"
            onPress={() => look("library")}
          />
        </View>
      )}

      <Text style={styles.attempts}>
        {stats.attemptsLeft} of {MAX_RECAPTURES_PER_DAY} looks left today
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: { flexGrow: 1, padding: 24, paddingTop: 68, gap: 16 },
  back: { alignSelf: "flex-start" },
  backLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.accentInk,
  },
  header: { gap: 4 },
  lead: {
    fontFamily: fonts.body,
    fontSize: 15.5,
    lineHeight: 23,
    color: colors.inkSoft,
  },
  guideCard: { gap: 10 },
  guideLabel: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: colors.muted,
  },
  guide: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    opacity: 0.55,
    backgroundColor: colors.tintDeep,
  },
  guideHint: {
    fontFamily: fonts.serifItalic,
    fontSize: 13.5,
    color: colors.muted,
  },
  actions: { gap: 10 },
  privacyNote: {
    fontFamily: fonts.serifItalic,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
    paddingHorizontal: 2,
  },
  lookingCard: { alignItems: "center", gap: 10, paddingVertical: 26 },
  lookingText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkSoft,
  },
  attempts: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 1.3,
    color: colors.muted,
    textAlign: "center",
  },
  outcomeCard: { alignItems: "center", gap: 12, paddingVertical: 28 },
  outcomeGlyph: { fontSize: 34, color: colors.clay },
  outcomeTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 20,
    color: colors.ink,
    textAlign: "center",
  },
  outcomeBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.inkSoft,
    textAlign: "center",
  },
  outcomeMeta: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.muted,
    textAlign: "center",
  },
  laterLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 14.5,
    color: colors.muted,
  },
  fallbackCard: { gap: 8 },
  fallbackTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.ink,
  },
  fallbackBody: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  fallbackLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 14.5,
    color: colors.accentInk,
    marginTop: 4,
  },
});
