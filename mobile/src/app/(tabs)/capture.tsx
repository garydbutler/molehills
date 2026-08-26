/*
  Capture — "Snap the truth". Photograph whatever feels like a mountain.
  Uses expo-image-picker for camera/library access.
*/
import { Alert, Image, StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { File, Directory, Paths } from "expo-file-system";
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
import { makeProject, useStore } from "@/store/app-store";

const SPACES = ["Living room", "Desk", "Garden", "Garage", "Something else"];

const PHOTOS_DIR = "molehill-photos";

async function copyToDurableStorage(cacheUri: string): Promise<string> {
  const photosDir = new Directory(Paths.document, PHOTOS_DIR);
  if (!photosDir.exists) {
    photosDir.create();
  }

  const ext = cacheUri.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const sourceFile = new File(cacheUri);
  const destFile = new File(photosDir, filename);

  await sourceFile.copy(destFile);

  return destFile.uri;
}

export default function Capture() {
  const { addProject } = useStore();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [space, setSpace] = useState("Living room");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Molehill needs access to your photos to select an image of your space.",
        [{ text: "OK" }],
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
      Alert.alert(
        "Permission needed",
        "Molehill needs camera access to photograph your space.",
        [{ text: "OK" }],
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

  const begin = () => {
    const name = title.trim() || `${space} reset`;
    const project = makeProject(name, space, photoUri ?? undefined);
    addProject(project);
    router.replace(`/vision/${project.id}`);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Kicker>Step 01 · Capture</Kicker>
        <Headline>
          Snap the <SerifEm>truth</SerifEm>.
        </Headline>
        <Text style={styles.lead}>
          Photograph whatever feels like a mountain — no tidying first, ever.
        </Text>
      </View>

      <Card style={styles.panel}>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <Pressable onPress={clearPhoto} style={styles.clearButton}>
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

        <Text style={styles.label}>What are we tackling?</Text>
        <Field
          placeholder="e.g. The living room, the wild garden…"
          value={title}
          onChangeText={setTitle}
        />
        <Text style={[styles.label, { marginTop: 8 }]}>Where is it?</Text>
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
        <PrimaryButton label="Show me the end state" onPress={begin} />
        {!photoUri && (
          <Text style={styles.note}>
            A photo helps you see the transformation — but you can skip it and
            add one later.
          </Text>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 24,
    paddingTop: 68,
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
});
