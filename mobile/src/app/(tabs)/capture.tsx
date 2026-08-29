/*
  Capture — "Show us where it stands". A photo, or one honest sentence.

  There is no category picker and no title box on purpose. Both are decisions
  the user has to make before they get anything, and the plan already comes
  back with a title and a project kind the model worked out itself.
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
  Mascot,
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
import { FREE_PLAN_ALLOWANCE, useProAccess } from "@/lib/purchases";
import { copyToDurableStorage } from "@/lib/photos";
import { ask, tell } from "@/lib/dialog";

/* The plan names the project. This is only a stand-in for the offline
   fallback, where there is no model to name it. */
/* Matches the recapture note cap — a description, never the work itself. */
const MAX_DESCRIPTION_CHARS = 600;

function fallbackName(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 5).join(" ");
  if (!words) return "A new project";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function Capture() {
  const {
    addProject,
    todayProject,
    setTodayProject,
    plansUsed,
    recordPlanUsed,
  } = useStore();
  const { pro, ready: proReady } = useProAccess();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // null = follow the photo. Set only when they choose for themselves.
  const [evidencePick, setEvidencePick] = useState<Evidence | null>(null);

  const evidence: Evidence = evidencePick ?? (photoUri ? "photo" : "words");
  const canBegin = !!photoUri || description.trim().length > 0;

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      tell(
        "Permission needed",
        "Inchmeal needs access to your photos to select an image of your project.",
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
        "Inchmeal needs camera access to photograph your project.",
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
    const typed = description.trim();
    // A project can start from a photo, a sentence, or both — never neither.
    if (!photoUri && !typed) return;

    /* Each plan is a paid vision-model call, so it is the one metered action.
       Wait for the entitlement to load rather than risk showing a paywall to
       someone who already subscribed. */
    if (proReady && !pro && plansUsed >= FREE_PLAN_ALLOWANCE) {
      router.push("/paywall");
      return;
    }

    setLoading(true);
    try {
      const plan = await fetchPlan(photoUri ?? undefined, typed || undefined);
      const project = {
        ...makeProjectFromPlan(plan, photoUri ?? undefined),
        description: typed || undefined,
        evidence,
      };
      // Only a plan we actually received counts against the allowance — a
      // failed call must never cost someone one of their free plans.
      recordPlanUsed();
      addProject(project);
      startProject(project.id);
      return;
    } catch (err) {
      console.warn("API plan failed, using fallback:", err);
    } finally {
      setLoading(false);
    }

    const project = {
      ...makeProject(fallbackName(typed), "", photoUri ?? undefined),
      description: typed || undefined,
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
          Show us where it <SerifEm>stands</SerifEm>.
        </Headline>
        <Text style={styles.lead}>
          Photograph it, mess and all — or, if there is nothing to
          photograph, just describe it. No tidying first, ever.
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

        <Text style={styles.label}>
          {photoUri ? "Anything we should know? (optional)" : "What needs doing?"}
        </Text>
        <Field
          multiline
          maxLength={MAX_DESCRIPTION_CHARS}
          placeholder={
            photoUri
              ? "e.g. The boxes on the left are staying — it's the rest I can't face."
              : "e.g. The history essay is due Friday and I have a title and nothing else."
          }
          value={description}
          onChangeText={setDescription}
        />
        <Text style={styles.inputHint}>
          {photoUri
            ? "The photo is enough on its own. Add a line only if it helps."
            : "A sentence or two is plenty. Inchmeal names the project and works out what kind of thing it is."}
        </Text>

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
            <Mascot pose="notebook" height={104} />
            <ActivityIndicator size="small" color={colors.accentInk} />
            <Text style={styles.loadingText}>
              Looking at your project and making a calm plan…
            </Text>
          </View>
        ) : (
          <PrimaryButton
            label="Build my plan"
            onPress={begin}
            disabled={!canBegin}
          />
        )}

        {!canBegin && !loading && (
          <Text style={styles.note}>
            Take a photo, or describe it in a sentence. Either one is enough.
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
  inputHint: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    marginTop: -2,
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
