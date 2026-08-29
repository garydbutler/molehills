/*
  Today — at most three jobs, all from ONE project. The kitchen and the essay
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

export default function Today() {
  const { todayProject, projects, markTired, user } = useStore();
  const router = useRouter();
  const dayName = DAYS[new Date().getDay()];

  const active = todayProject;
  const saved = projects.filter((p) => p.status === "saved");

  if (!active) {
    return (
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.kickerRow}>
            <Kicker>
              {dayName} · signed in as {user?.name}
            </Kicker>
            <Pressable onPress={() => router.push("/settings")} hitSlop={8}>
              <Text style={styles.signOut}>Settings</Text>
            </Pressable>
          </View>
          <Headline>
            Nothing on today<SerifEm>.</SerifEm>
          </Headline>
        </View>
        <Card style={styles.doneCard}>
          <Mascot pose="sprout" height={92} />
          <Text style={styles.doneBody}>
            {saved.length > 0
              ? "You have projects waiting. Pick one from Journey when you're ready."
              : "Capture something when you're ready to start."}
          </Text>
        </Card>
      </View>
    );
  }

  const stats = projectStats(active);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <View style={styles.kickerRow}>
          <Kicker>
            {dayName} · signed in as {user?.name}
          </Kicker>
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
  },
  signOut: {
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
