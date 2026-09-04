/* A local progress log first, then non-blocking AI encouragement. */
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { radii } from "@/theme/tokens";
import {
  Card,
  Field,
  Headline,
  Kicker,
  Press,
  PrimaryButton,
  SerifEm,
} from "@/components/ui";
import {
  dayKey,
  nextId,
  useStore,
  type CheckpointKind,
} from "@/store/app-store";
import { copyToDurableStorage } from "@/lib/photos";
import { fetchProgressFeedback } from "@/lib/api";
import { feedbackWithFallback } from "@/lib/progress-checkpoints";
import { tell } from "@/lib/dialog";

const MAX_NOTE_CHARS = 600;

export default function Recapture() {
  const { id, kind: requestedKind } = useLocalSearchParams<{
    id: string;
    kind?: CheckpointKind;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projects, saveProgressLog, updateProgressFeedback } = useStore();
  const project = projects.find((item) => item.id === id);

  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string>();
  const [savedLogId, setSavedLogId] = useState<string>();
  const [feedback, setFeedback] = useState<string>();

  const kind: CheckpointKind =
    project?.pendingCheckpoint?.kind ?? requestedKind ?? "optional";
  const latestPhoto = useMemo(
    () =>
      [...(project?.recaptures ?? [])]
        .reverse()
        .find((entry) => entry.photoUri)?.photoUri ?? project?.photoUri,
    [project],
  );

  if (!project) {
    return (
      <View style={styles.page}>
        <Kicker>Project not found</Kicker>
      </View>
    );
  }

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/today");

  const pickPhoto = async (pick: "camera" | "library") => {
    const permission =
      pick === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      tell("Permission needed", "unbig needs access to add that photo.");
      return;
    }

    const result =
      pick === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
    if (result.canceled || !result.assets[0]) return;

    try {
      setPhotoUri(await copyToDurableStorage(result.assets[0].uri));
    } catch {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const submit = () => {
    const trimmed = note.trim();
    if (!photoUri && !trimmed) return;

    const logId = nextId();
    const completedStepIds = project.steps
      .filter((step) => step.done)
      .map((step) => step.id);
    saveProgressLog(project.id, {
      id: logId,
      kind,
      photoUri,
      note: trimmed || undefined,
      completedStepIds,
    });
    setSavedLogId(logId);

    void feedbackWithFallback(() =>
      fetchProgressFeedback({
        nowPhotoUri: photoUri,
        note: trimmed || undefined,
        beforePhotoUri: latestPhoto,
        title: project.title,
        vision: project.vision,
        description: project.description,
        day: dayKey(),
        completedJobs: project.steps
          .filter((step) => step.done)
          .map((step) => step.label),
      }),
    ).then((result) => {
      updateProgressFeedback(project.id, logId, result.message, result.source);
      setFeedback(result.message);
    });
  };

  if (savedLogId) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.page, { paddingTop: Math.max(68, insets.top + 24) }]}
      >
        <Card style={styles.outcomeCard}>
          <Text style={styles.outcomeGlyph}>❋</Text>
          <Text style={styles.outcomeTitle}>
            {kind === "project"
              ? `${project.title} is finished.`
              : kind === "day"
                ? "That’s the day, done."
                : "Progress saved."}
          </Text>
          {feedback ? (
            <Text style={styles.outcomeBody}>{feedback}</Text>
          ) : (
            <View style={styles.feedbackPending}>
              <ActivityIndicator size="small" color={colors.accentInk} />
              <Text style={styles.feedbackPendingText}>Having a look…</Text>
            </View>
          )}
          {kind === "day" ? (
            <View style={styles.actions}>
              <PrimaryButton
                label="Rest now"
                onPress={() => router.replace("/today")}
              />
              <PrimaryButton
                label="Keep going"
                variant="outline"
                onPress={() => router.replace(`/vision/${project.id}`)}
              />
            </View>
          ) : (
            <PrimaryButton
              label={kind === "project" ? "See the journey" : "Back to project"}
              onPress={() => router.replace(`/vision/${project.id}`)}
            />
          )}
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.page, { paddingTop: Math.max(68, insets.top + 24) }]}
    >
      <Press onPress={goBack} style={styles.back}>
        <Text style={styles.backLabel}>← Back</Text>
      </Press>
      <View style={styles.header}>
        <Kicker>{kind === "optional" ? "Log progress" : "Checkpoint"}</Kicker>
        <Headline>
          What <SerifEm>moved</SerifEm>?
        </Headline>
        <Text style={styles.lead}>
          Add a photo, a note, or both. Your checked jobs already count—this is
          the part you get to look back on.
        </Text>
      </View>

      {latestPhoto ? (
        <Card style={styles.guideCard}>
          <Text style={styles.guideLabel}>LAST LOOK</Text>
          <Image
            accessibilityLabel="Your last check-in photo, for comparison"
            source={{ uri: latestPhoto }}
            resizeMode="cover"
            style={styles.guide}
          />
        </Card>
      ) : null}

      {photoUri ? (
        <Card style={styles.photoCard}>
          <Image
            accessibilityLabel="The photo you just took"
            source={{ uri: photoUri }}
            resizeMode="cover"
            style={styles.photoPreview}
          />
          <Press onPress={() => setPhotoUri(undefined)} hitSlop={8}>
            <Text style={styles.removePhoto}>Remove photo</Text>
          </Press>
        </Card>
      ) : (
        <View style={styles.actions}>
          <PrimaryButton label="Take a photo" onPress={() => pickPhoto("camera")} />
          <PrimaryButton
            label="Choose a photo"
            variant="outline"
            onPress={() => pickPhoto("library")}
          />
        </View>
      )}

      <Field
        placeholder="What changed? One specific sentence is plenty."
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={MAX_NOTE_CHARS}
      />
      {/* Same rule as Capture: warn before the cap bites, never after. */}
      {note.length > MAX_NOTE_CHARS - 100 ? (
        <Text style={styles.counter}>
          {MAX_NOTE_CHARS - note.length} characters left
        </Text>
      ) : null}
      <PrimaryButton
        label={kind === "optional" ? "Save progress" : "Finish check-in"}
        onPress={submit}
        disabled={!photoUri && note.trim().length === 0}
      />
      <Text style={styles.privacyNote}>
        Saved on this device. A temporary copy is used only to offer feedback.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: { flexGrow: 1, padding: 24, paddingTop: 68, gap: 16 },
  back: { alignSelf: "flex-start" },
  backLabel: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.accentInk },
  header: { gap: 4 },
  lead: { fontFamily: fonts.body, fontSize: 17, lineHeight: 23, color: colors.inkSoft },
  guideCard: { gap: 10 },
  guideLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.4, color: colors.muted },
  guide: { width: "100%", height: 160, borderRadius: radii.frame, opacity: 0.6, backgroundColor: colors.tintDeep },
  actions: { gap: 10, alignSelf: "stretch" },
  photoCard: { gap: 10 },
  photoPreview: { width: "100%", height: 220, borderRadius: radii.frame, backgroundColor: colors.tintDeep },
  removePhoto: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.muted, textAlign: "center" },
  counter: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    textAlign: "right",
  },
  privacyNote: { fontFamily: fonts.serifItalic, fontSize: 13, lineHeight: 20, color: colors.muted, textAlign: "center" },
  outcomeCard: { alignItems: "center", gap: 14, paddingVertical: 28 },
  outcomeGlyph: { fontSize: 34, color: colors.clayInk },
  outcomeTitle: { fontFamily: fonts.sansSemi, fontSize: 21, color: colors.ink, textAlign: "center" },
  outcomeBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.inkSoft, textAlign: "center" },
  feedbackPending: { flexDirection: "row", alignItems: "center", gap: 10 },
  feedbackPendingText: { fontFamily: fonts.serifItalic, fontSize: 15, color: colors.muted },
});
