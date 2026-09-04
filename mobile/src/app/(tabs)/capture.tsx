/*
  Capture — "What feels too big?" A photo, or one honest sentence.

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
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { radii } from "@/theme/tokens";
import {
  Card,
  Field,
  Icon,
  Mountain,
  Press,
  PrimaryButton,
} from "@/components/ui";
import {
  makeProject,
  makeProjectFromPlan,
  useStore,
  type Evidence,
} from "@/store/app-store";
import { ApiRefusal, fetchPlan } from "@/lib/api";
import { FREE_PLAN_ALLOWANCE, useProAccess } from "@/lib/purchases";
import { copyToDurableStorage } from "@/lib/photos";
import { ask, tell } from "@/lib/dialog";

const CAPTURE_HERO = require("../../../assets/brand/banner-parts/capture-hero-composite.jpg");

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
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Start as they began. This is only the default for later check-ins; the
  // recapture screen always lets them use the other method that day.
  const evidence: Evidence = photoUri ? "photo" : "words";
  const canBegin = !!photoUri || description.trim().length > 0;

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      tell(
        "Permission needed",
        "unbig needs access to your photos to select an image of your project.",
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
        "unbig needs camera access to photograph your project.",
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

  /* Any new input means they have moved on from the last outcome. */
  const onDescriptionChange = (text: string) => {
    setDescription(text);
    if (notice) setNotice(null);
  };

  /* Switching projects mid-day is how nothing gets finished, so a second
     project asks before it takes over the day. */
  const startProject = (projectId: string) => {
    if (!todayProject || todayProject.id === projectId) {
      setTodayProject(projectId);
      router.replace(`/vision/${projectId}?fresh=1`);
      return;
    }

    ask(
      "Work on this now, or save it for later?",
      `${todayProject.title} is today's project. Its leftover jobs stay with it either way — nothing is deleted.`,
      ["Work on it now", "Save for later"],
    ).then((choice) => {
      if (choice !== 0) {
        /* Saved for later means today is untouched: stay put and say where
           it went, rather than dropping them into the project they just
           declined to start. */
        setNotice("Saved. It's in Journey whenever you're ready.");
        setDescription("");
        setPhotoUri(null);
        return;
      }
      setTodayProject(projectId);
      router.replace(`/vision/${projectId}?fresh=1`);
    });
  };

  const begin = async () => {
    const typed = description.trim();
    // A project can start from a photo, a sentence, or both — never neither.
    if (!photoUri && !typed) return;

    /* A local pre-check so the common case never costs a round trip. The
       server is the real referee — this only saves a request, and is skipped
       for subscribers so a just-completed purchase is never second-guessed
       while the RevenueCat webhook is still in flight. */
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
      /* A refusal is an answer, not an outage. Falling through to the local
         fallback here would hand out the thing we just declined to sell. */
      if (ApiRefusal.is(err)) {
        setLoading(false);
        if (err.upgrade) {
          router.push("/paywall");
        } else {
          tell(
            err.status === 401 ? "Please sign in again" : "Not right now",
            err.message,
          );
        }
        return;
      }
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
      contentContainerStyle={[
        styles.page,
        {
          paddingTop: Math.max(68, insets.top + 24),
          /* The tab bar floats over the paper now, so the last card needs
             room to clear it instead of hiding behind the blur. */
          paddingBottom: 64 + insets.bottom + 24,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Image
          accessibilityLabel="Something new. What feels too big? No tidying first, ever."
          source={CAPTURE_HERO}
          resizeMode="cover"
          style={[
            styles.captureHero,
            {
              width: screenWidth,
              height: screenWidth * (1101 / 1429),
            },
          ]}
        />
      </View>

      <Card style={styles.panel}>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image
              accessibilityLabel="The photo you just took"
              source={{ uri: photoUri }}
              style={styles.preview}
            />
            <Press
              onPress={clearPhoto}
              style={styles.clearButton}
              disabled={loading}
            >
              <Text style={styles.clearLabel}>✕ Retake</Text>
            </Press>
          </View>
        ) : (
          <View style={styles.captureButtons}>
            <Press onPress={takePhoto} style={styles.captureButton}>
              <Icon name="camera" size={28} />
              <Text style={styles.captureLabel}>Take photo</Text>
            </Press>
            <Press onPress={pickFromLibrary} style={styles.captureButton}>
              <Icon name="library" size={28} />
              <Text style={styles.captureLabel}>Choose from library</Text>
            </Press>
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
              : "e.g. The job application closes Friday and I’ve saved the listing, nothing else."
          }
          value={description}
          onChangeText={onDescriptionChange}
        />
        {/* A cap that silently stops typing reads as a broken keyboard. It
            appears only as the limit comes into reach. */}
        {description.length > MAX_DESCRIPTION_CHARS - 100 ? (
          <Text style={styles.counter}>
            {MAX_DESCRIPTION_CHARS - description.length} characters left
          </Text>
        ) : null}
        <Text style={styles.inputHint}>
          {photoUri
            ? "The photo is enough on its own. Add a line only if it helps."
            : "A sentence or two is plenty. unbig names the project and works out what kind of thing it is."}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Mountain state="crumbling" height={88} />
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

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

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
    gap: 0,
  },
  header: { marginHorizontal: -24 },
  captureHero: {
    marginTop: -12,
    backgroundColor: colors.paper,
  },
  panel: { gap: 12, marginTop: -4 },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: colors.muted,
  },
  inputHint: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    marginTop: -2,
  },
  counter: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    textAlign: "right",
  },
  /* Warm ground, so a saved-for-later reads as a good outcome rather than
     an error notice. */
  notice: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    color: colors.clayInk,
    backgroundColor: colors.washWarm,
    borderRadius: radii.frame,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  note: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    textAlign: "center",
  },
  captureButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  captureButton: {
    flex: 1,
    backgroundColor: colors.tint,
    borderRadius: radii.frame,
    paddingVertical: 20,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.accentInk,
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
    borderRadius: radii.frame,
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
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
  },
});
