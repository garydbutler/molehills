/*
  Capture — "Snap the truth". In the prototype the photo step is simulated
  with a space picker; the camera roll / vision model plugs in later.
*/
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function Capture() {
  const { addProject } = useStore();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [space, setSpace] = useState("Living room");

  const begin = () => {
    const name = title.trim() || `${space} reset`;
    const project = makeProject(name, space);
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
          For now, point us at it.
        </Text>
      </View>

      <Card style={styles.panel}>
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
        <Text style={styles.note}>
          Photo capture + AI vision arrive with the backend — this creates a
          real 12-step plan either way.
        </Text>
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
});
