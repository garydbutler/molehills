/*
  Today — at most three jobs, all from ONE project. The kitchen and the application
  never share a day. The day ends by showing the project again, not by ticking
  a box.
*/
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  DonePicture,
  Headline,
  Kicker,
  Mascot,
  PrimaryButton,
  Ring,
  SerifEm,
  StepRow,
} from "@/components/ui";
import { projectStats, useStore } from "@/store/app-store";

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
  const { todayProject, projects, markTired, user } = useStore();
  const router = useRouter();
  const dayName = DAYS[new Date().getDay()];
  /* Whatever is stored — a full name, an email, or a relay address — reduce
     it to one short greeting-sized word. */
  const firstName =
    user?.name?.trim().split("@")[0].split(/\s+/)[0] || "there";

  const active = todayProject;
  const saved = projects.filter((p) => p.status === "saved");

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
            <Pressable onPress={() => router.push("/settings")} hitSlop={8}>
              <Text style={styles.signOut}>Settings</Text>
            </Pressable>
          </View>
          <Headline>
            Nothing on today<SerifEm>.</SerifEm>
          </Headline>
        </View>
        {saved.length > 0 ? (
          <Card style={styles.doneCard}>
            <Mascot pose="sprout" height={92} />
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
            <Mascot pose="sprout" height={92} />
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

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <View style={styles.kickerRow}>
          <View style={styles.kickerFill}>
            <Kicker numberOfLines={1}>
              {dayName} · {firstName}
            </Kicker>
          </View>
          <Pressable onPress={() => router.push("/settings")} hitSlop={8}>
            <Text style={styles.signOut}>Settings</Text>
          </Pressable>
        </View>
        <Headline>
          {stats.restingUntilTomorrow ? (
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

      {/* The done picture, filling in as the project actually moves. */}
      {active.endStateImage || active.photoUri ? (
        <Card style={styles.pictureCard}>
          <DonePicture
            before={active.photoUri}
            done={
              active.endStateImage
                ? `data:image/png;base64,${active.endStateImage}`
                : undefined
            }
            progress={active.progress ?? 0}
            height={180}
          />
          <Text style={styles.pictureMeta}>
            {Math.round((active.progress ?? 0) * 100)}% of the way there
          </Text>
        </Card>
      ) : null}

      {stats.restingUntilTomorrow ? (
        <Card style={styles.doneCard}>
          <Mascot pose="sprout" height={92} />
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
          <Mascot pose="sprout" height={92} />
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
                {stats.todaySteps.length}{" "}
                {stats.todaySteps.length === 1 ? "job" : "jobs"} today · about{" "}
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
                done={false}
                onPress={() => router.push(`/recapture/${active.id}`)}
              />
            ))}
          </View>

          <PrimaryButton
            label="I think I'm done for today"
            onPress={() => router.push(`/recapture/${active.id}`)}
          />

          {!stats.tired ? (
            <Pressable onPress={() => markTired(active.id)} hitSlop={8}>
              <Text style={styles.tiredLink}>
                I&apos;m exhausted — give me just one
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.gentle}>
              One real job. That still counts as a day.
            </Text>
          )}
        </>
      )}
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
    fontSize: 16,
    color: colors.ink,
  },
  introStepBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
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
    fontSize: 10.5,
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
    fontSize: 14,
    color: colors.muted,
  },
  visionLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 14.5,
    color: colors.accentInk,
    marginTop: 6,
  },
  steps: { gap: 10 },
  tiredLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 14.5,
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
  doneCard: { alignItems: "center", gap: 8, paddingVertical: 30 },
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
