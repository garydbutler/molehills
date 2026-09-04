/*
  Vision — "See the end state". Shows the captured photo, AI-generated plan,
  and optionally generates a photoreal tidy version of the space.
*/
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { Card, Kicker, Mascot, PrimaryButton, Ring } from "@/components/ui";
import { projectStats, useStore } from "@/store/app-store";
import { fetchEndState } from "@/lib/api";
import { tell } from "@/lib/dialog";
import { FEEDBACK_EMAIL } from "@/lib/site";

const ORDINALS = ["Day one", "Day two", "Day three", "Day four", "Day five"];

export default function Vision() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const { projects, updateProject, setTodayProject, toggleStep } = useStore();
  // ponytail: the plan is read-only only on the just-created preview; from
  // Journey the same screen is where jobs get checked off.
  const readOnly = fresh === "1";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const project = projects.find((p) => p.id === id);

  const [generatingEndState, setGeneratingEndState] = useState(false);
  const [showEndState, setShowEndState] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const projectId = project?.id;
  const pendingKind = project?.pendingCheckpoint?.kind;

  /* Vision is a hidden tab route, so its ScrollView stays mounted while the
     user visits Journey. A project detail should still open at its beginning. */
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const frame = requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
      return () => cancelAnimationFrame(frame);
    }, [id]),
  );

  useEffect(() => {
    if (projectId && pendingKind) {
      router.push(`/recapture/${projectId}?kind=${pendingKind}`);
    }
  }, [projectId, pendingKind, router]);

  if (!project) {
    return (
      <View style={styles.page}>
        <Kicker>Project not found</Kicker>
      </View>
    );
  }

  const s = projectStats(project);
  const days = Array.from(
    new Set(project.steps.map((st) => st.dayIndex)),
  ).sort((a, b) => a - b);

  const handleGenerateEndState = async () => {
    if (!project.photoUri) return;

    setGeneratingEndState(true);
    try {
      const result = await fetchEndState(
        project.photoUri,
        project.vision,
        project.space,
        project.title,
        project.id,
      );
      updateProject(project.id, {
        endStateImage: result.image,
        endStateImageMimeType: result.mimeType,
      });
      setShowEndState(true);
    } catch (err) {
      console.warn("End state generation failed:", err);
      tell(
        "Couldn't generate image",
        "The vision service is temporarily unavailable. Your plan is still here — try again later.",
      );
    } finally {
      setGeneratingEndState(false);
    }
  };

  const toggleImageView = () => {
    setShowEndState((prev) => !prev);
  };

  const hasEndState = !!project.endStateImage;
  const displayingEndState = showEndState && hasEndState;
  const canStartToday =
    !s.complete &&
    !s.restingUntilTomorrow &&
    !s.todayPlanComplete &&
    !s.pendingCheckpoint;

  const reportIncorrectVision = async () => {
    const subject = encodeURIComponent("Incorrect unbig vision result");
    const body = encodeURIComponent(
      [
        "What did unbig get wrong?",
        "",
        "",
        "---",
        `Project: ${project.title}`,
        `Vision: ${project.vision}`,
        `Detected space: ${project.space}`,
        `Plan: ${project.steps.map((step) => step.label).join("; ")}`,
        "",
        "Please remove anything above that you do not want to share.",
      ].join("\n"),
    );
    const url = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(url);
    } catch {
      tell(
        "Email feedback",
        `Send what looked wrong to ${FEEDBACK_EMAIL}. Please do not include anything private.`,
      );
    }
  };

  // Finishing is celebrated once, quietly. We never auto-start the next
  // project — that is a cousin of a streak. We ask.
  const nextUp = projects.find(
    (p) => p.id !== project.id && !projectStats(p).complete,
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[styles.page, { paddingTop: Math.max(60, insets.top + 24) }]}
    >
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/journey"))}
        style={styles.back}
      >
        <Text style={styles.backLabel}>← Back</Text>
      </Pressable>

      {s.complete ? (
        <Card style={styles.finishedCard}>
          <Mascot pose="sprout" height={120} />
          <Text style={styles.finishedTitle}>{project.title} is finished.</Text>
          <Text style={styles.finishedBody}>
            Nothing magical happened here. Twelve small visits did.
          </Text>
          {nextUp ? (
            <View style={styles.finishedActions}>
              <PrimaryButton
                label={`Start ${nextUp.title}`}
                variant="outline"
                onPress={() => {
                  setTodayProject(nextUp.id);
                  router.replace(`/vision/${nextUp.id}`);
                }}
              />
              <Text style={styles.finishedRest}>Or rest. Both are fine.</Text>
            </View>
          ) : (
            <Text style={styles.finishedRest}>Rest. You earned the quiet.</Text>
          )}
        </Card>
      ) : null}

      <Card style={styles.visionCard}>
        {displayingEndState && project.endStateImage ? (
          <Image
            source={{ uri: `data:${project.endStateImageMimeType ?? "image/png"};base64,${project.endStateImage}` }}
            resizeMode="cover"
            style={styles.visionPhoto}
          />
        ) : project.photoUri ? (
          <Image source={{ uri: project.photoUri }} resizeMode="cover" style={styles.visionPhoto} />
        ) : !s.complete ? (
          // The finished card above already carries the mascot — a second one
          // right below it just reads as a doubled logo.
          <Mascot pose="sprout" height={62} />
        ) : null}
        <Kicker>
          {displayingEndState ? "The calm version" : "Your vision"}
        </Kicker>
        <Text style={styles.visionLine}>{project.vision}</Text>
        <Text style={styles.visionTitle}>{project.title}</Text>

        {project.photoUri && (
          <View style={styles.endStateActions}>
            {generatingEndState ? (
              <View style={styles.generatingContainer}>
                <ActivityIndicator size="small" color={colors.accentInk} />
                <Text style={styles.generatingText}>
                  Imagining the calm version…
                </Text>
              </View>
            ) : hasEndState ? (
              <Pressable onPress={toggleImageView} style={styles.toggleButton}>
                <Text style={styles.toggleLabel}>
                  {displayingEndState ? "Show before" : "Show the end state"}
                </Text>
              </Pressable>
            ) : (
              <PrimaryButton
                label="Show me the end state"
                variant="outline"
                onPress={handleGenerateEndState}
              />
            )}
          </View>
        )}
      </Card>

      <View style={styles.aiNote}>
        <Text style={styles.aiNoteText}>
          AI can misread photos and descriptions. Check this vision and plan
          before you act on it.
        </Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={reportIncorrectVision}
          style={styles.feedbackButton}
        >
          <Text style={styles.feedbackLabel}>Report an incorrect result →</Text>
        </Pressable>
      </View>

      {canStartToday ? (
        <PrimaryButton
          label={s.todayDone > 0 ? "Continue today’s jobs →" : "Start today’s three →"}
          onPress={() => {
            setTodayProject(project.id);
            router.replace("/today");
          }}
        />
      ) : null}

      <View style={styles.progressRow}>
        <Ring pct={s.pct} size={92} />
        <View style={styles.progressText}>
          <Text style={styles.progressBig}>{s.total} steps total</Text>
          <Text style={styles.progressMeta}>
            {s.daysIn} {s.daysIn === 1 ? "day" : "days"} in · {s.total - s.done}{" "}
            to go
          </Text>
          <Text style={styles.progressMeta}>
            Three little steps a day — or keep going when you have momentum.
          </Text>
        </View>
      </View>

      {project.pendingCheckpoint ? (
        <Card style={styles.checkpointCard}>
          <Text style={styles.checkpointTitle}>Finish your check-in</Text>
          <Text style={styles.checkpointBody}>
            Your jobs are checked. Add a photo or note to close this checkpoint.
          </Text>
          <PrimaryButton
            label="Continue check-in"
            onPress={() =>
              router.push(
                `/recapture/${project.id}?kind=${project.pendingCheckpoint?.kind}`,
              )
            }
          />
        </Card>
      ) : (project.completedSinceLog ?? 0) > 0 ? (
        <PrimaryButton
          label={`Log today’s progress · ${project.completedSinceLog} ${project.completedSinceLog === 1 ? "job" : "jobs"}`}
          variant="outline"
          onPress={() => router.push(`/recapture/${project.id}?kind=optional`)}
        />
      ) : null}

      {days.map((d) => (
        <View key={d} style={styles.dayBlock}>
          <Text style={styles.dayLabel}>{ORDINALS[d] ?? `Day ${d + 1}`}</Text>
          {project.steps
            .filter((st) => st.dayIndex === d)
            .map((st) => (
              <Pressable
                key={st.id}
                disabled={readOnly}
                onPress={() => toggleStep(project.id, st.id)}
                style={styles.stepRow}
              >
                {st.done ? (
                  <View style={[styles.box, styles.boxDone]}>
                    <Text style={styles.check}>{"\u2713"}</Text>
                  </View>
                ) : readOnly ? (
                  <View style={styles.bullet} />
                ) : (
                  <View style={styles.box} />
                )}
                <Text style={[styles.stepLabel, st.done && styles.stepDone]}>
                  {st.label}
                </Text>
                <Text style={styles.minutes}>{st.minutes} min</Text>
              </Pressable>
            ))}
        </View>
      ))}

      {(project.recaptures ?? []).length > 0 ? (
        <View style={styles.timeline}>
          <Text style={styles.timelineTitle}>Progress log</Text>
          {[...(project.recaptures ?? [])]
            .reverse()
            .map((entry) => (
              <Card key={entry.id} style={styles.timelineEntry}>
                <Text style={styles.timelineDate}>
                  {new Date(entry.at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                {entry.photoUri ? (
                  <Image
                    source={{ uri: entry.photoUri }}
                    resizeMode="cover"
                    style={styles.timelinePhoto}
                  />
                ) : null}
                {entry.note ? (
                  <Text style={styles.timelineNote}>{entry.note}</Text>
                ) : null}
                <Text style={styles.timelineFeedback}>
                  {entry.message ?? "Having a look…"}
                </Text>
              </Card>
            ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkpointCard: { gap: 9 },
  checkpointTitle: { fontFamily: fonts.sansSemi, fontSize: 17, color: colors.ink },
  checkpointBody: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.inkSoft },
  timeline: { gap: 10, marginTop: 4 },
  timelineTitle: { fontFamily: fonts.sansSemi, fontSize: 19, color: colors.ink },
  timelineEntry: { gap: 9 },
  timelineDate: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2, color: colors.muted },
  timelinePhoto: { width: "100%", height: 180, borderRadius: 12, backgroundColor: colors.tintDeep },
  timelineNote: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.ink },
  timelineFeedback: { fontFamily: fonts.serifItalic, fontSize: 14.5, lineHeight: 21, color: colors.inkSoft },
  finishedCard: { alignItems: "center", gap: 10, paddingVertical: 26 },
  finishedTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 19,
    color: colors.ink,
    textAlign: "center",
  },
  finishedBody: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: "center",
  },
  finishedActions: { alignSelf: "stretch", gap: 8 },
  finishedRest: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
  },
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 48,
    gap: 18,
  },
  back: { alignSelf: "flex-start" },
  backLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.accentInk,
  },
  visionCard: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 22,
    backgroundColor: colors.tint,
  },
  visionPhoto: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: colors.tintDeep,
  },
  visionLine: {
    fontFamily: fonts.serifItalic,
    fontSize: 21,
    color: colors.ink,
    textAlign: "center",
  },
  visionTitle: {
    fontFamily: fonts.sansExtra,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.ink,
    textAlign: "center",
  },
  endStateActions: {
    marginTop: 10,
    width: "100%",
  },
  aiNote: {
    gap: 7,
    paddingHorizontal: 4,
  },
  aiNoteText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
  },
  feedbackButton: {
    alignSelf: "flex-start",
    minHeight: 48,
    justifyContent: "center",
  },
  feedbackLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.accentInk,
  },
  generatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
  },
  generatingText: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.muted,
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.accentInk,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  progressText: { flex: 1, gap: 3 },
  progressBig: {
    fontFamily: fonts.sansSemi,
    fontSize: 19,
    color: colors.ink,
  },
  progressMeta: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  dayBlock: { gap: 8 },
  dayLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.accentInk,
    alignItems: "center",
    justifyContent: "center",
  },
  boxDone: { backgroundColor: colors.accentInk },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
    marginHorizontal: 9,
  },
  check: {
    color: colors.bone,
    fontSize: 14,
    fontFamily: fonts.bodySemi,
  },
  stepLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  stepDone: {
    textDecorationLine: "line-through",
    color: colors.muted,
  },
  minutes: {
    fontFamily: fonts.mono,
    fontSize: 11.5,
    color: colors.muted,
  },
});
