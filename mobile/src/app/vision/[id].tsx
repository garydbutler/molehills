/*
  Vision — "See the end state". Shows the captured photo, AI-generated plan,
  and optionally generates a photoreal tidy version of the space.
*/
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { Card, Kicker, PrimaryButton, Ring } from "@/components/ui";
import { projectStats, useStore } from "@/store/app-store";
import { fetchEndState } from "@/lib/api";

const ORDINALS = ["Day one", "Day two", "Day three", "Day four", "Day five"];

export default function Vision() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, toggleStep, updateProject } = useStore();
  const router = useRouter();
  const project = projects.find((p) => p.id === id);

  const [generatingEndState, setGeneratingEndState] = useState(false);
  const [showEndState, setShowEndState] = useState(false);

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
      const result = await fetchEndState(project.photoUri, project.vision);
      updateProject(project.id, { endStateImage: result.image });
      setShowEndState(true);
    } catch (err) {
      console.warn("End state generation failed:", err);
      Alert.alert(
        "Couldn't generate image",
        "The vision service is temporarily unavailable. Your plan is still here — try again later.",
        [{ text: "OK" }],
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

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backLabel}>← Back</Text>
      </Pressable>

      <Card style={styles.visionCard}>
        {displayingEndState && project.endStateImage ? (
          <Image
            source={{ uri: `data:image/png;base64,${project.endStateImage}` }}
            style={styles.visionPhoto}
          />
        ) : project.photoUri ? (
          <Image source={{ uri: project.photoUri }} style={styles.visionPhoto} />
        ) : (
          <Text style={styles.visionGlyph}>{project.glyph}</Text>
        )}
        <Kicker>
          {displayingEndState ? "The calm version" : "Your vision"} ·{" "}
          {project.space}
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
                  {displayingEndState ? "Show before" : "Show tidy version"}
                </Text>
              </Pressable>
            ) : (
              <PrimaryButton
                label="Show me the room tidy"
                variant="outline"
                onPress={handleGenerateEndState}
              />
            )}
          </View>
        )}
      </Card>

      <View style={styles.progressRow}>
        <Ring pct={s.pct} size={92} />
        <View style={styles.progressText}>
          <Text style={styles.progressBig}>{s.total} steps total</Text>
          <Text style={styles.progressMeta}>
            {s.daysIn} {s.daysIn === 1 ? "day" : "days"} in · {s.total - s.done}{" "}
            to go
          </Text>
          <Text style={styles.progressMeta}>
            Three little steps a day — never more.
          </Text>
        </View>
      </View>

      {days.map((d) => (
        <View key={d} style={styles.dayBlock}>
          <Text style={styles.dayLabel}>{ORDINALS[d] ?? `Day ${d + 1}`}</Text>
          {project.steps
            .filter((st) => st.dayIndex === d)
            .map((st) => (
              <Pressable
                key={st.id}
                onPress={() => toggleStep(project.id, st.id)}
                style={({ pressed }) => [
                  styles.stepRow,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={[styles.box, st.done && styles.boxDone]}>
                  {st.done && <Text style={styles.check}>{"\u2713"}</Text>}
                </View>
                <Text style={[styles.stepLabel, st.done && styles.stepDone]}>
                  {st.label}
                </Text>
                <Text style={styles.minutes}>{st.minutes} min</Text>
              </Pressable>
            ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 30,
    backgroundColor: colors.tint,
  },
  visionGlyph: { fontSize: 52 },
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
