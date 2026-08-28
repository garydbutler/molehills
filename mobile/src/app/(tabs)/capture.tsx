/*
  Capture — "Snap the truth". Photograph whatever feels like a mountain.
  Uses expo-image-picker for camera/library access.
  Calls /api/plan for AI-generated task breakdown when photo is captured.
*/
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  Chip,
  Field,
  Headline,
  Kicker,
  PrimaryButton,
  SerifEm,
} from "@/components/ui";
import {
  makeProject,
  makeProjectFromPlan,
  useStore,
  type Evidence,
} from "@/store/app-store";
import { fetchPlan } from "@/lib/api";
import { copyToDurableStorage } from "@/lib/photos";
import { ask, tell } from "@/lib/dialog";

// A project is any piece of work — not always a place.
const SPACES = [
  "Kitchen",
  "Living room",
  "Bathroom",
  "Garden",
  "Garage",
  "Desk",
  "Essay",
  "Homework",
  "Something else",
];

export default function Capture() {
  const { addProject, todayProject, setTodayProject } = useStore();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [space, setSpace] = useState("Kitchen");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // null = follow the photo. Set only when they choose for themselves.
  const [evidencePick, setEvidencePick] = useState<Evidence | null>(null);

  const evidence: Evidence = evidencePick ?? (photoUri ? "photo" : "words");

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      tell(
        "Permission needed",
        "Molehill needs access to your photos to select an image of your project.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const durableUri = await copyToDurableStorage(result.assets[0].uri);
        setPhotoUri(durableUri);
      } catch (e) {
        console.warn("Failed to save photo:", e);
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      tell(
        "Permission needed",
        "Molehill needs camera access to photograph your project.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const durableUri = await copyToDurableStorage(result.assets[0].uri);
        setPhotoUri(durableUri);
      } catch (e) {
        console.warn("Failed to save photo:", e);
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  const clearPhoto = () => {
    setPhotoUri(null);
  };

  /* Switching projects mid-day is how nothing gets finished, so a second
     project asks before it takes over the day. */
  const startProject = (projectId: string) => {
    if (!todayProject || todayProject.id === projectId) {
      setTodayProject(projectId);
      router.replace(`/vision/${projectId}`);
      return;
    }

    ask(
      "Work on this now, or save it for later?",
      `${todayProject.title} is today's project. Its leftover jobs stay with it either way — nothing is deleted.`,
      ["Work on it now", "Save for later"],
    ).then((choice) => {
      if (choice === 0) setTodayProject(projectId);
      router.replace(`/vision/${projectId}`);
    });
  };

  const begin = async () => {
    const typed = title.trim();
    const name = typed || `${space} reset`;

    // A project can start from a photo, a sentence, or both.
    if (photoUri || typed) {
      setLoading(true);
      try {
        const plan = await fetchPlan(
          photoUri ?? undefined,
          name,
          space,
          typed || undefined,
        );
        const project = {
          ...makeProjectFromPlan(plan, photoUri ?? undefined),
          description: typed || undefined,
          evidence,
        };
        addProject(project);
        startProject(project.id);
        return;
      } catch (err) {
        console.warn("API plan failed, using fallback:", err);
      } finally {
        setLoading(false);
      }
    }

    const project = {
      ...makeProject(name, space, photoUri ?? undefined),
      evidence,
    };
    addProject(project);
    startProject(project.id);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Kicker>Step 01 · Capture</Kicker>
        <Headline>
          Snap the <SerifEm>truth</SerifEm>.
        </Headline>
        <Text style={styles.lead}>
          Show us where the project stands — a photo, a screenshot, or just a
          sentence. No tidying first, ever.
        </Text>
      </View>

      <Card style={styles.panel}>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <Pressable
              onPress={clearPhoto}
              style={styles.clearButton}
              disabled={loading}
            >
              <Text style={styles.clearLabel}>✕ Retake</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.captureButtons}>
            <Pressable onPress={takePhoto} style={styles.captureButton}>
              <Text style={styles.captureIcon}>📷</Text>
              <Text style={styles.captureLabel}>Take photo</Text>
            </Pressable>
            <Pressable onPress={pickFromLibrary} style={styles.captureButton}>
              <Text style={styles.captureIcon}>🖼️</Text>
              <Text style={styles.captureLabel}>Choose from library</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.label}>What are we finishing?</Text>
        <Field
          placeholder="e.g. Clean the kitchen, finish the history essay…"
          value={title}
          onChangeText={setTitle}
        />
        <Text style={[styles.label, { marginTop: 8 }]}>What kind of project?</Text>
        <View style={styles.chips}>
          {SPACES.map((s) => (
            <Chip
              key={s}
              label={s}
              active={space === s}
              onPress={() => setSpace(s)}
            />
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 8 }]}>
          How will you show me it got done?
        </Text>
        <View style={styles.chips}>
          <Chip
            label="A photo"
            active={evidence === "photo"}
            onPress={() => setEvidencePick("photo")}
          />
          <Chip
            label="A sentence"
            active={evidence === "words"}
            onPress={() => setEvidencePick("words")}
          />
        </View>
        <Text style={styles.evidenceHint}>
          {evidence === "photo"
            ? "At the end of a day you'll photograph it again — that's what marks the jobs done, not a checkbox."
            : "At the end of a day you'll say what changed, in a sentence. For work that's private or has nothing to photograph — we never ask to see the work itself."}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.accentInk} />
            <Text style={styles.loadingText}>
              Looking at your project and making a calm plan…
            </Text>
          </View>
        ) : (
          <PrimaryButton label="Build my plan" onPress={begin} />
        )}

        {!photoUri && !loading && (
          <Text style={styles.note}>
            No photo? A sentence still gets you a plan.
          </Text>
        )}
      </Card>
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
    paddingBottom: 40,
    gap: 22,
  },
  header: { gap: 4 },
  lead: {
    fontFamily: fonts.bodyLight,
    fontSize: 15.5,
    lineHeight: 24,
    color: colors.inkSoft,
    maxWidth: 330,
  },
  panel: { gap: 12 },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: colors.muted,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  note: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    textAlign: "center",
  },
  evidenceHint: {
    fontFamily: fonts.serifItalic,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
    marginTop: -2,
    marginBottom: 4,
  },
  captureButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  captureButton: {
    flex: 1,
    backgroundColor: colors.tint,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.accentInk,
  },
  captureIcon: {
    fontSize: 28,
  },
  captureLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.accentInk,
  },
  previewContainer: {
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: colors.tintDeep,
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.accentInk,
  },
  loadingContainer: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
  },
  loadingText: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
  },
});
