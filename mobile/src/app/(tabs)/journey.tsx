/*
  Journey — "Watch it change". Every project, its ring, and the proof that
  small steps add up: before → during → after.
*/
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  BeforeAfter,
  Card,
  Headline,
  Kicker,
  PrimaryButton,
  Ring,
  SerifEm,
} from "@/components/ui";
import { projectStats, useStore } from "@/store/app-store";
import { ask } from "@/lib/dialog";

export default function Journey() {
  const { projects, todayProject, setTodayProject } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const finished = projects.filter((p) => projectStats(p).complete);
  const active = projects.filter((p) => !projectStats(p).complete);

  /* Switching is allowed and never punished — we just say plainly what
     happens to the project being put down. */
  const switchToday = (projectId: string, projectTitle: string) => {
    if (todayProject?.id === projectId) return;

    if (!todayProject) {
      setTodayProject(projectId);
      return;
    }

    ask(
      `Make ${projectTitle} today's project?`,
      `${todayProject.title}'s leftover jobs will still be there tomorrow. Today will be ${projectTitle} instead.`,
      ["Switch", "Never mind"],
    ).then((choice) => {
      if (choice === 0) setTodayProject(projectId);
    });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.page, { paddingTop: Math.max(68, insets.top + 24) }]}
    >
      <View style={styles.header}>
        <Kicker>Step 04 · Journey</Kicker>
        <Headline>
          Watch it <SerifEm>change</SerifEm>.
        </Headline>
      </View>

      {active.map((p) => {
        const s = projectStats(p);
        const latestEntry = [...(p.recaptures ?? [])]
          .reverse()
          .find((entry) => entry.photoUri || entry.note);
        const latestPhoto = latestEntry?.photoUri ?? p.photoUri;
        return (
          <View key={p.id} style={styles.reveal}>
          <Link href={`/vision/${p.id}`} asChild>
            <Card style={styles.projectRow}>
              {latestPhoto ? (
                <Image source={{ uri: latestPhoto }} style={styles.projectThumb} />
              ) : (
                <Ring pct={s.pct} size={72} stroke={6} />
              )}
              <View style={styles.projectText}>
                <Text style={styles.projectTitle}>{p.title}</Text>
                <Text style={styles.projectMeta}>
                  {s.done} of {s.total} jobs · {s.daysIn}{" "}
                  {s.daysIn === 1 ? "day" : "days"} shown
                </Text>
                <Text style={styles.projectVision}>{p.vision}</Text>
                {(p.recaptures ?? []).length > 0 ? (
                  <Text style={styles.updateCount}>
                    {(p.recaptures ?? []).length} progress {p.recaptures?.length === 1 ? "update" : "updates"}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>→</Text>
            </Card>
          </Link>
          {p.id === todayProject?.id ? (
            <Text style={styles.todayTag}>TODAY&apos;S PROJECT</Text>
          ) : (
            <Pressable onPress={() => switchToday(p.id, p.title)} hitSlop={8}>
              <Text style={styles.switchLink}>Make this today&apos;s project</Text>
            </Pressable>
          )}
          {p.pendingCheckpoint ? (
            <Pressable
              onPress={() =>
                router.push(
                  `/recapture/${p.id}?kind=${p.pendingCheckpoint?.kind}`,
                )
              }
              hitSlop={8}
            >
              <Text style={styles.logLink}>Finish your check-in →</Text>
            </Pressable>
          ) : (p.completedSinceLog ?? 0) > 0 ? (
            <PrimaryButton
              label={`Log today’s progress · ${p.completedSinceLog} ${p.completedSinceLog === 1 ? "job" : "jobs"}`}
              variant="outline"
              onPress={() => router.push(`/recapture/${p.id}?kind=optional`)}
            />
          ) : null}
          {p.photoUri && p.endStateImage ? (
            <Card>
              <Text style={styles.revealCaption}>DRAG TO SEE IT DONE</Text>
              <BeforeAfter
                before={p.photoUri}
                after={`data:${p.endStateImageMimeType ?? "image/png"};base64,${p.endStateImage}`}
              />
            </Card>
          ) : null}
          </View>
        );
      })}

      {finished.map((p) => {
        const s = projectStats(p);
        const latestPhoto = [...(p.recaptures ?? [])]
          .reverse()
          .find((entry) => entry.photoUri)?.photoUri ?? p.photoUri;
        return (
          <View key={p.id} style={styles.reveal}>
          <Link href={`/vision/${p.id}`} asChild>
            <Card style={StyleSheet.flatten([styles.projectRow, styles.finishedRow])}>
              {latestPhoto ? (
                <Image source={{ uri: latestPhoto }} style={styles.projectThumb} />
              ) : (
                <Ring pct={100} size={72} stroke={6} />
              )}
              <View style={styles.projectText}>
                <Text style={styles.projectTitle}>{p.title}</Text>
                <Text style={styles.finishedLabel}>
                  Finished · {s.total} tiny visits
                </Text>
              </View>
              <Text style={styles.chevron}>→</Text>
            </Card>
          </Link>
          {p.photoUri && p.endStateImage ? (
            <Card>
              <Text style={styles.revealCaption}>DRAG TO SEE IT DONE</Text>
              <BeforeAfter
                before={p.photoUri}
                after={`data:${p.endStateImageMimeType ?? "image/png"};base64,${p.endStateImage}`}
              />
            </Card>
          ) : null}
          </View>
        );
      })}

      <Text style={styles.closing}>
        Nothing magical happened to any of these. Twelve tiny visits did.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 68,
    gap: 14,
  },
  reveal: { gap: 10 },
  todayTag: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.accentInk,
    paddingLeft: 4,
  },
  switchLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 13.5,
    color: colors.muted,
    paddingLeft: 4,
  },
  logLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.accentInk,
    paddingLeft: 4,
  },
  revealCaption: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: colors.muted,
  },
  header: { gap: 2, marginBottom: 8 },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  projectThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.tintDeep,
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
  updateCount: {
    fontFamily: fonts.bodySemi,
    fontSize: 12.5,
    color: colors.accentInk,
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
