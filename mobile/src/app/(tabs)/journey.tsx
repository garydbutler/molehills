/*
  Journey — "Watch it change". Every project, its ring, and the proof that
  small steps add up: before → during → after.
*/
import {
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
import { radii } from "@/theme/tokens";
import {
  BeforeAfter,
  Card,
  Headline,
  Kicker,
  Mountain,
  Press,
  PrimaryButton,
  SerifEm,
} from "@/components/ui";
import { projectStats, useStore } from "@/store/app-store";
import { ask } from "@/lib/dialog";

const JOURNEY_STEPS = require("../../../assets/brand/banner-parts/journey-progress-steps.jpg");
const TEXT_PROJECT_FALLBACK = require("../../../assets/brand/banner-parts/project-text-fallback.jpg");

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
      <View style={styles.header}>
        <Kicker>Your projects</Kicker>
        <Headline>
          Watch it <SerifEm>change</SerifEm>.
        </Headline>
        <View style={styles.journeyArtwork}>
          <Image
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            source={JOURNEY_STEPS}
            resizeMode="cover"
            style={styles.journeyArtworkImage}
          />
          <Text style={styles.journeyAside}>
            Every small visit changes the view.
          </Text>
        </View>
      </View>

      {active.map((p) => {
        const s = projectStats(p);
        /* The original capture, not the newest check-in: Journey is the
           "watch it change" screen, so the row should show what it looked
           like before. */
        const beforePhoto = p.photoUri;
        return (
          <View key={p.id} style={styles.reveal}>
            <Link href={`/vision/${p.id}`} asChild>
              <Press scaleTo={0.985}>
                <Card
                  style={[
                    styles.projectRow,
                    p.id === todayProject?.id && styles.projectRowToday,
                  ]}
                >
                  {beforePhoto ? (
                    <Image
                      accessibilityLabel={`${p.title} before you started`}
                      source={{ uri: beforePhoto }}
                      style={styles.projectThumb}
                    />
                  ) : (
                    <Image
                      accessibilityLabel={`${p.title}, a project described in words`}
                      source={TEXT_PROJECT_FALLBACK}
                      style={styles.projectThumb}
                    />
                  )}
                  <View style={styles.projectText}>
                    <Text style={styles.projectTitle}>{p.title}</Text>
                    <Text style={styles.projectMeta}>
                      {s.done} of {s.total} jobs · {s.daysIn}{" "}
                      {s.daysIn === 1 ? "day" : "days"} shown
                    </Text>
                    <Text style={styles.projectVision}>{p.vision}</Text>
                    <Text style={styles.visionAction}>
                      Open vision &amp; full plan
                    </Text>
                    {(p.recaptures ?? []).length > 0 ? (
                      <Text style={styles.updateCount}>
                        {(p.recaptures ?? []).length} progress{" "}
                        {p.recaptures?.length === 1 ? "update" : "updates"}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.chevron}>→</Text>
                </Card>
              </Press>
            </Link>
            {/* Owned by the card above, so it reads as belonging to it: these
                used to float in the gap with equal spacing to both
                neighbours, claiming neither. */}
            <View style={styles.cardFooter}>
              {p.id === todayProject?.id ? (
                <Text style={styles.todayTag}>TODAY&apos;S PROJECT</Text>
              ) : (
                <Press onPress={() => switchToday(p.id, p.title)} hitSlop={8}>
                  <Text style={styles.switchLink}>
                    Make this today&apos;s project
                  </Text>
                </Press>
              )}
              {p.pendingCheckpoint ? (
                <Press
                  onPress={() =>
                    router.push(
                      `/recapture/${p.id}?kind=${p.pendingCheckpoint?.kind}`,
                    )
                  }
                  hitSlop={8}
                >
                  <Text style={styles.logLink}>Finish your check-in →</Text>
                </Press>
              ) : (p.completedSinceLog ?? 0) > 0 ? (
                <PrimaryButton
                  label={`Log today’s progress · ${p.completedSinceLog} ${p.completedSinceLog === 1 ? "job" : "jobs"}`}
                  variant="outline"
                  onPress={() => router.push(`/recapture/${p.id}?kind=optional`)}
                />
              ) : null}
            </View>
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
        const beforePhoto = p.photoUri;
        return (
          <View key={p.id} style={styles.reveal}>
            <Link href={`/vision/${p.id}`} asChild>
              <Press scaleTo={0.985}>
                <Card
                  style={StyleSheet.flatten([
                    styles.projectRow,
                    styles.finishedRow,
                  ])}
                >
                  {beforePhoto ? (
                    <Image
                      accessibilityLabel={`${p.title} before you started`}
                      source={{ uri: beforePhoto }}
                      style={styles.projectThumb}
                    />
                  ) : (
                    <Image
                      accessibilityLabel={`${p.title}, a project described in words`}
                      source={TEXT_PROJECT_FALLBACK}
                      style={styles.projectThumb}
                    />
                  )}
                  <View style={styles.projectText}>
                    <Text style={styles.projectTitle}>{p.title}</Text>
                    <Text style={styles.finishedLabel}>
                      Finished · {s.total} tiny visits
                    </Text>
                    <Text style={styles.visionAction}>
                      Open vision &amp; full plan
                    </Text>
                  </View>
                  <Text style={styles.chevron}>→</Text>
                </Card>
              </Press>
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

      {projects.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Mountain state="whole" height={78} />
          <Text style={styles.emptyTitle}>Nothing here yet.</Text>
          <Text style={styles.emptyBody}>
            Every project you start shows up here, with the photos you take
            along the way. Nothing is ever removed for being unfinished.
          </Text>
          <PrimaryButton
            label="Start something"
            onPress={() => router.push("/capture")}
          />
        </Card>
      ) : null}

      {/* Speaks only about projects that exist — it used to print under an
          empty list, closing a story that had not started. */}
      {finished.length > 0 ? (
        <Text style={styles.closing}>
          Nothing magical happened to any of these. Twelve tiny visits did.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 68,
    /* Must stay clearly larger than `reveal`/`cardFooter` (10) so a project
       and its own controls group before they group with the next project. */
    gap: 28,
  },
  emptyCard: { alignItems: "center", gap: 16, paddingVertical: 26 },
  emptyTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 19,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: "center",
  },
  /* The live project: tinted ground + a solid accent edge. Nothing else on
     this screen carries a fill, so "which one is today's" is answerable
     without reading a word. */
  projectRowToday: {
    backgroundColor: colors.tint,
    borderColor: colors.accentInk,
    borderLeftWidth: 4,
  },
  /* Sits tight under its own card and indented from the page, so proximity
     assigns it to the card above rather than the one below. */
  cardFooter: {
    gap: 10,
    paddingLeft: 16,
    paddingTop: 2,
  },
  reveal: { gap: 10 },  // card + its own footer: one group
  todayTag: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.accentInk,
    paddingLeft: 4,
  },
  switchLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.muted,
    paddingLeft: 4,
  },
  logLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.accentInk,
    paddingLeft: 4,
  },
  revealCaption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.muted,
  },
  header: { gap: 2, marginBottom: 0 },
  journeyArtwork: {
    height: 160,
    marginTop: 18,
    marginHorizontal: -24,
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  journeyArtworkImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  journeyAside: {
    marginTop: 16,
    marginLeft: 24,
    maxWidth: 220,
    fontFamily: fonts.serifItalic,
    fontSize: 21,
    lineHeight: 27,
    color: colors.inkSoft,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  projectThumb: {
    width: 72,
    height: 72,
    borderRadius: radii.frame,
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
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
  },
  projectVision: {
    fontFamily: fonts.serifItalic,
    fontSize: 13,
    color: colors.inkSoft,
  },
  visionAction: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.accentInk,
    marginTop: 2,
  },
  updateCount: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.accentInk,
  },
  finishedLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.accentInk,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 19,
    color: colors.muted,
  },
  closing: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
    marginTop: "auto",
    paddingBottom: 12,
  },
});
