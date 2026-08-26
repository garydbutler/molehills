/*
  Today — exactly three little steps, then rest. Mirrors the landing page's
  promise: "Finish them and you're done — genuinely done."
*/
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  Headline,
  Kicker,
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
  const { projects, toggleStep, user, signOut } = useStore();
  const active = projects[0];
  const stats = projectStats(active);
  const dayName = DAYS[new Date().getDay()];

  const allDone = stats.todaySteps.length === 0;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.kickerRow}>
          <Kicker>
            {dayName} · signed in as {user?.name}
          </Kicker>
          <Pressable onPress={signOut} hitSlop={8}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>
        <Headline>
          Three little steps<SerifEm>.</SerifEm>
        </Headline>
      </View>

      {allDone ? (
        <Card style={styles.doneCard}>
          <Text style={styles.doneGlyph}>{"\u274B"}</Text>
          <Text style={styles.doneTitle}>That's everything for today.</Text>
          <Text style={styles.doneBody}>
            The rest can wait — you did the kind thing.
          </Text>
          <Link href={`/vision/${active.id}`} style={styles.visionLink}>
            Revisit the vision →
          </Link>
        </Card>
      ) : (
        <>
          <Card style={styles.progressRow}>
            <Ring pct={Math.round((stats.todayDone / 3) * 100)} size={84} />
            <View style={styles.progressText}>
              <Text style={styles.progressTitle}>{active.title}</Text>
              <Text style={styles.progressMeta}>
                {stats.todayDone} of 3 done · no rush
              </Text>
              <Text style={styles.progressMeta}>
                {stats.total - stats.done} small steps to go
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
                meta={`${active.space} · ${s.minutes} min`}
                done={false}
                onPress={() => toggleStep(active.id, s.id)}
              />
            ))}
          </View>

          {stats.todayDone > 0 && (
            <Text style={styles.gentle}>
              Every tick moves the ring. That's the whole trick.
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 24,
    paddingTop: 68,
    gap: 20,
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
  gentle: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  doneCard: { alignItems: "center", gap: 8, paddingVertical: 30 },
  doneGlyph: { fontSize: 34, color: colors.clay },
  doneTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 19,
    color: colors.ink,
  },
  doneBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: "center",
  },
});
