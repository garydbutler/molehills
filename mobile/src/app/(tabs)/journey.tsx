/*
  Journey — "Watch it change". Every project, its ring, and the proof that
  small steps add up: before → during → after.
*/
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  Headline,
  Kicker,
  Ring,
  SerifEm,
} from "@/components/ui";
import { projectStats, useStore } from "@/store/app-store";

export default function Journey() {
  const { projects } = useStore();

  const finished = projects.filter((p) => projectStats(p).done === p.steps.length);
  const active = projects.filter(
    (p) => projectStats(p).done < p.steps.length,
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Kicker>Step 04 · Grow</Kicker>
        <Headline>
          Watch it <SerifEm>change</SerifEm>.
        </Headline>
      </View>

      {active.map((p) => {
        const s = projectStats(p);
        return (
          <Link key={p.id} href={`/vision/${p.id}`} asChild>
            <Card style={styles.projectRow}>
              <Ring pct={s.pct} size={72} stroke={6} />
              <View style={styles.projectText}>
                <Text style={styles.projectTitle}>{p.title}</Text>
                <Text style={styles.projectMeta}>
                  {s.done} of {s.total} steps · {s.daysIn}{" "}
                  {s.daysIn === 1 ? "day" : "days"} in
                </Text>
                <Text style={styles.projectVision}>{p.vision}</Text>
              </View>
              <Text style={styles.chevron}>→</Text>
            </Card>
          </Link>
        );
      })}

      {finished.map((p) => {
        const s = projectStats(p);
        return (
          <Link key={p.id} href={`/vision/${p.id}`} asChild>
            <Card style={[styles.projectRow, styles.finishedRow]}>
              <Ring pct={100} size={72} stroke={6} />
              <View style={styles.projectText}>
                <Text style={styles.projectTitle}>{p.title}</Text>
                <Text style={styles.finishedLabel}>
                  Finished · {s.total} tiny visits
                </Text>
              </View>
              <Text style={styles.chevron}>→</Text>
            </Card>
          </Link>
        );
      })}

      <Text style={styles.closing}>
        Nothing magical happened to any of these rooms. Twelve tiny visits did.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 24,
    paddingTop: 68,
    gap: 14,
  },
  header: { gap: 2, marginBottom: 8 },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  finishedRow: {
    backgroundColor: colors.tint,
  },
  projectText: { flex: 1, gap: 3 },
  projectTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 17,
    color: colors.ink,
  },
  projectMeta: {
    fontFamily: fonts.mono,
    fontSize: 11.5,
    letterSpacing: 1,
    color: colors.muted,
  },
  projectVision: {
    fontFamily: fonts.serifItalic,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
  finishedLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13.5,
    color: colors.accentInk,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.muted,
  },
  closing: {
    fontFamily: fonts.serifItalic,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
    marginTop: "auto",
    paddingBottom: 12,
  },
});
