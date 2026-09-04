/*
  Today — at most three jobs, all from ONE project. The kitchen and the application
  never share a day. The day ends by showing the project again, not by ticking
  a box.
*/
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  DonePicture,
  Headline,
  Kicker,
  Mountain,
  Press,
  PrimaryButton,
  Ring,
  SerifEm,
  StepRow,
} from "@/components/ui";
import { projectStats, useStore } from "@/store/app-store";

const TODAY_MOUNTAIN = require("../../../assets/brand/banner-parts/today-mountain.jpg");

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function IntroStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <View style={styles.introStep}>
      <View style={styles.introNum}>
        <Text style={styles.introNumText}>{n}</Text>
      </View>
      <View style={styles.introStepText}>
        <Text style={styles.introStepTitle}>{title}</Text>
        <Text style={styles.introStepBody}>{body}</Text>
      </View>
    </View>
  );
}

export default function Today() {
  const { todayProject, projects, markTired, toggleStep, user } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dayName = DAYS[new Date().getDay()];
  /* Whatever is stored — a full name, an email, or a relay address — reduce
     it to one short greeting-sized word. */
  const firstName =
    user?.name?.trim().split("@")[0].split(/\s+/)[0] || "there";

  const active = todayProject;
  const saved = projects.filter((p) => p.status === "saved");
  const activeId = active?.id;
  const pendingKind = active?.pendingCheckpoint?.kind;

  /* The three-jobs-done moment is the one success note in the app; anything
     more and the tick's own impact stops meaning anything. Latched so a
     re-render on the finished day doesn't buzz again. */
  const congratulated = useRef(false);
  const planComplete = active ? projectStats(active).todayPlanComplete : false;
  useEffect(() => {
    if (!planComplete) {
      congratulated.current = false;
      return;
    }
    if (congratulated.current) return;
    congratulated.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [planComplete]);

  useEffect(() => {
    if (activeId && pendingKind) {
      router.push(`/recapture/${activeId}?kind=${pendingKind}`);
    }
  }, [activeId, pendingKind, router]);

  if (!active) {
    return (
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerFill}>
              <Kicker numberOfLines={1}>
                {dayName} · {firstName}
              </Kicker>
            </View>
            <Press onPress={() => router.push("/settings")} hitSlop={8}>
              <Text style={styles.signOut}>Settings</Text>
            </Press>
          </View>
          <Headline>
            Nothing on today<SerifEm>.</SerifEm>
          </Headline>
        </View>
        {saved.length > 0 ? (
          <Card style={styles.doneCard}>
            <Mountain state="whole" height={78} />
            <Text style={styles.doneBody}>
              You have projects waiting. Pick one from Journey when you’re
              ready.
            </Text>
          </Card>
        ) : (
          /* First run. Someone who has never used this has no idea what
             "capture" means, and an empty screen with one line of text reads
             as a dead end. Say what happens, in the order it happens. */
          <Card style={styles.introCard}>
            <Mountain state="whole" height={78} />
            <Text style={styles.introLead}>
              Here’s how it goes.
            </Text>
            <View style={styles.introSteps}>
              <IntroStep
                n="1"
                title="Show it to us"
                body="Photograph the thing, mess and all — or just describe it in a sentence. No tidying first, ever."
              />
              <IntroStep
                n="2"
                title="We write the plan"
                body="Twelve small jobs, each a few minutes. Not a lecture, not a system to maintain."
              />
              <IntroStep
                n="3"
                title="Three a day, never a fourth"
                body="You'll see today's three and nothing else. Miss a day and nothing is lost — there are no streaks here."
              />
            </View>
            <PrimaryButton
              label="Start something"
              onPress={() => router.push("/capture")}
            />
          </Card>
        )}
      </View>
    );
  }

  const stats = projectStats(active);
  const latestCheckpointPhoto = [...(active.recaptures ?? [])]
    .reverse()
    .find((entry) => entry.photoUri)?.photoUri;
  /* When the day is over the screen is just a recap — give the photo and the
     mascot card less room so it fits without a scroll. */
  const dayOver = stats.restingUntilTomorrow || stats.complete;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.page,
        {
          paddingTop: Math.max(68, insets.top + 24),
          /* The tab bar floats over the paper now, so the last card needs
             room to clear it instead of hiding behind the blur. */
          paddingBottom: 64 + insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.visualHeader}>
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          source={TODAY_MOUNTAIN}
          resizeMode="contain"
          style={styles.todayMountain}
        />
        <Press
          onPress={() => router.push("/settings")}
          hitSlop={8}
          style={styles.settingsAction}
        >
          <Text style={styles.signOut}>Settings</Text>
        </Press>
        <View style={styles.visualHeaderCopy}>
          <Kicker numberOfLines={1}>
            {dayName} · {firstName}
          </Kicker>
          <Headline style={styles.visualHeadline}>
            {stats.pendingCheckpoint ? (
              <>
                Checkpoint time<SerifEm>.</SerifEm>
              </>
            ) : stats.restingUntilTomorrow ? (
              <>
                Done for today<SerifEm>.</SerifEm>
              </>
            ) : stats.tired ? (
              <>
                One small thing<SerifEm>.</SerifEm>
              </>
            ) : (
              <>
                Three little jobs<SerifEm>.</SerifEm>
              </>
            )}
          </Headline>
        </View>
      </View>

      {/* The done picture, filling in as the project actually moves. */}
      {active.endStateImage || active.photoUri ? (
        <Card style={styles.pictureCard}>
          <DonePicture
            before={latestCheckpointPhoto ?? active.photoUri}
            done={
              active.endStateImage
                ? `data:${active.endStateImageMimeType ?? "image/png"};base64,${active.endStateImage}`
                : undefined
            }
            progress={active.progress ?? 0}
            height={dayOver ? 140 : 180}
          />
          <Text style={styles.pictureMeta}>
            {latestCheckpointPhoto ? "Latest check-in" : `${Math.round((active.progress ?? 0) * 100)}% of the way there`}
          </Text>
        </Card>
      ) : null}

      {stats.pendingCheckpoint ? (
        <Card style={styles.doneCard}>
          <Mountain state="crumbling" height={78} />
          <Text style={styles.doneTitle}>One last little thing.</Text>
          <Text style={styles.doneBody}>
            Add a photo or note to close out this checkpoint.
          </Text>
          <PrimaryButton
            label="Finish your check-in"
            onPress={() =>
              router.push(
                `/recapture/${active.id}?kind=${stats.pendingCheckpoint?.kind}`,
              )
            }
          />
        </Card>
      ) : stats.restingUntilTomorrow ? (
        <Card style={styles.doneCard}>
          <Mountain state="stones" height={62} />
          <Text style={styles.doneTitle}>
            That&apos;s everything for today.
          </Text>
          <Text style={styles.doneBody}>
            You showed the work. The rest waits for tomorrow.
          </Text>
          <Link href={`/vision/${active.id}`} style={styles.visionLink}>
            See the vision →
          </Link>
        </Card>
      ) : stats.complete ? (
        <Card style={styles.doneCard}>
          <Mountain state="stones" height={62} />
          <Text style={styles.doneTitle}>{active.title} is finished.</Text>
          <Link href={`/vision/${active.id}`} style={styles.visionLink}>
            See how it changed →
          </Link>
        </Card>
      ) : (
        <>
          <Card style={styles.progressRow}>
            <Ring pct={stats.pct} size={84} />
            <View style={styles.progressText}>
              <Text style={styles.progressTitle}>{active.title}</Text>
              <Text style={styles.progressMeta}>
                {stats.todayRemaining.length}{" "}
                {stats.todayRemaining.length === 1 ? "job" : "jobs"} left today · about{" "}
                {stats.todayMinutes} min
              </Text>
              <Text style={styles.progressMeta}>
                {stats.total - stats.done} still to go, no rush
              </Text>
              <Link href={`/vision/${active.id}`} style={styles.visionLink}>
                See the vision →
              </Link>
            </View>
          </Card>

          <View style={styles.steps}>
            {stats.todaySteps.map((s) => (
              <StepRow
                key={s.id}
                label={s.label}
                meta={`${s.minutes} min`}
                done={s.done}
                onPress={() => toggleStep(active.id, s.id)}
              />
            ))}
          </View>

          {!stats.tired ? (
            <Press onPress={() => markTired(active.id)} hitSlop={8}>
              <Text style={styles.tiredLink}>
                I&apos;m exhausted — give me just one
              </Text>
            </Press>
          ) : (
            <Text style={styles.gentle}>
              One real job. That still counts as a day.
            </Text>
          )}
        </>
      )}

      {/* Below the jobs, never above them: this card appears the moment a job
          is ticked, and inserting it above the list would slide the remaining
          rows down under the finger mid-tap. And never once the day has
          closed — the last thing on a finished day is not another ask. */}
      {!stats.pendingCheckpoint &&
      !stats.restingUntilTomorrow &&
      !stats.complete &&
      (active.completedSinceLog ?? 0) > 0 ? (
        <Card style={styles.logProgressCard}>
          <Text style={styles.logProgressTitle}>Pause for a quick look.</Text>
          <Text style={styles.logProgressBody}>
            Add a photo or note so you can see this progress later.
          </Text>
          <PrimaryButton
            label={`Log today’s progress · ${active.completedSinceLog} ${active.completedSinceLog === 1 ? "job" : "jobs"}`}
            variant="outline"
            onPress={() => router.push(`/recapture/${active.id}?kind=optional`)}
          />
        </Card>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: {
    flexGrow: 1,
    backgroundColor: colors.paper,
    padding: 24,
    paddingTop: 68,
    gap: 18,
  },
  header: { gap: 2 },
  visualHeader: {
    minHeight: 196,
    position: "relative",
    overflow: "hidden",
    marginHorizontal: -24,
    marginTop: -12,
  },
  todayMountain: {
    position: "absolute",
    left: -28,
    bottom: -8,
    width: "54%",
    height: 205,
    opacity: 0.9,
  },
  visualHeaderCopy: {
    position: "absolute",
    top: 48,
    left: "46%",
    right: 24,
    gap: 2,
  },
  visualHeadline: {
    fontSize: 34,
    lineHeight: 38,
  },
  settingsAction: {
    position: "absolute",
    zIndex: 2,
    top: 0,
    right: 24,
  },
  logProgressCard: { gap: 12 },
  logProgressTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 19,
    color: colors.ink,
  },
  logProgressBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  kickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  /* The day/name half yields; the Settings link never shrinks or wraps. */
  kickerFill: { flex: 1, minWidth: 0 },
  introCard: { alignItems: "center", gap: 18, paddingVertical: 26 },
  introLead: {
    fontFamily: fonts.serif,
    fontSize: 21,
    color: colors.ink,
  },
  introSteps: { gap: 18, alignSelf: "stretch" },
  introStep: { flexDirection: "row", gap: 13, alignItems: "flex-start" },
  introNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  introNumText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.accentInk,
  },
  introStepText: { flex: 1, gap: 3 },
  introStepTitle: {
    fontFamily: fonts.sansExtra,
    fontSize: 17,
    color: colors.ink,
  },
  introStepBody: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  signOut: {
    flexShrink: 0,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.muted,
  },
  pictureCard: { gap: 8 },
  pictureMeta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    color: colors.muted,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  progressText: { flex: 1, gap: 3 },
  progressTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 19,
    color: colors.ink,
  },
  progressMeta: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
  },
  visionLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.accentInk,
    marginTop: 6,
  },
  steps: { gap: 10 },
  tiredLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
  },
  gentle: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  /* Rest and completion are the only moments that earn the warm ground. */
  doneCard: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 18,
    backgroundColor: colors.washWarm,
  },
  doneTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 19,
    color: colors.ink,
    textAlign: "center",
  },
  doneBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: "center",
  },
});
