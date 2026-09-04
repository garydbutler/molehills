/*
  "What should we call you?"

  Asked once, right after the first sign-in, because neither provider gives us
  something reliable: Apple returns a name only on the very first
  authorisation and nothing ever again, and Google may hand back an address.
  Depending on either produced a header that greeted someone as
  GARYDBUTLER@GMAIL.COM.

  Skippable, and never asked twice. A tool that promises no guilt should not
  nag for a name.
*/
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  Field,
  Headline,
  Kicker,
  Mountain,
  Press,
  PrimaryButton,
  SerifEm,
} from "@/components/ui";
import { useStore } from "@/store/app-store";

export default function NamePrompt() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { user, setDisplayName, skipNamePrompt, hydrated } = useStore();
  const editing = source === "settings";

  const done = () => {
    if (editing && router.canGoBack()) router.back();
    else router.replace("/today");
  };

  if (!hydrated) return null;
  if (!user) return <Redirect href="/login" />;

  /* Mount the form only after hydration so its initial value cannot be taken
     from the temporary, signed-out state shown while storage is loading. */
  const initialName = user.name.includes("@") ? "" : user.name;

  return (
    <NameForm
      initialName={initialName}
      editing={editing}
      onSave={(name) => {
        setDisplayName(name);
        done();
      }}
      onSkip={() => {
        skipNamePrompt();
        done();
      }}
    />
  );
}

function NameForm({
  initialName,
  editing,
  onSave,
  onSkip,
}: {
  initialName: string;
  editing: boolean;
  onSave: (name: string) => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState(initialName);

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <Mountain state="whole" height={78} style={styles.motif} />
        <Kicker>One small thing</Kicker>
        <Headline>
          What should we <SerifEm>call you</SerifEm>?
        </Headline>
        <Text style={styles.lead}>
          Only ever used to say hello. It stays on this phone and is never
          shown to anyone else.
        </Text>
      </View>

      <Card style={styles.panel}>
        <Field
          placeholder="Your first name"
          value={name}
          onChangeText={setName}
        />
        <PrimaryButton
          label={editing ? "Save name" : "That's me"}
          disabled={!name.trim()}
          onPress={() => onSave(name)}
        />
        {!editing ? (
          <Press onPress={onSkip} hitSlop={8} style={styles.skip}>
            <Text style={styles.skipLabel}>Skip this</Text>
          </Press>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 24,
    paddingTop: 96,
    gap: 26,
  },
  hero: { gap: 14 },
  motif: { alignSelf: "flex-start", marginBottom: -2 },
  lead: {
    fontFamily: fonts.sans,
    fontSize: 17,
    lineHeight: 23,
    color: colors.muted,
  },
  panel: { gap: 16 },
  skip: { alignSelf: "center", paddingVertical: 6 },
  skipLabel: { fontFamily: fonts.sans, fontSize: 15, color: colors.muted },
});
