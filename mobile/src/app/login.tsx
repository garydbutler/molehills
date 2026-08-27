/*
  Login — simulated for the prototype. Google / Facebook / email all sign in
  locally; real OAuth arrives with the Next.js + Neon backend.
*/
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Redirect } from "expo-router";
import { useState } from "react";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  Field,
  Kicker,
  PrimaryButton,
  SerifEm,
} from "@/components/ui";
import { useStore } from "@/store/app-store";

export default function Login() {
  const { user, signIn } = useStore();
  const [email, setEmail] = useState("");
  if (user) return <Redirect href="/today" />;

  const providerSignIn = (provider: string) =>
    signIn({
      name: "Gary",
      email: email.trim() || "gary@molehills.app",
      provider,
    });

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <Kicker>A calmer way to get things done</Kicker>
        <Text style={styles.title}>
          Big things,{"\n"}
          finished <SerifEm>gently</SerifEm>.
        </Text>
        <Text style={styles.lead}>
          Photo the mountain. See the end state. Three little steps a day —
          never more.
        </Text>
      </View>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Try it now</Text>
        <Field
          placeholder="Email address (optional)"
          value={email}
          onChangeText={setEmail}
        />
        <PrimaryButton
          label="Continue with email"
          onPress={() => providerSignIn("email")}
        />
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>
        <Pressable
          onPress={() => providerSignIn("google")}
          style={({ pressed }) => [
            styles.oauthBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.oauthGlyph}>G</Text>
          <Text style={styles.oauthLabel}>Continue with Google</Text>
        </Pressable>
        <Pressable
          onPress={() => providerSignIn("facebook")}
          style={({ pressed }) => [
            styles.oauthBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.oauthGlyph, { color: "#3b5998" }]}>f</Text>
          <Text style={styles.oauthLabel}>Continue with Facebook</Text>
        </Pressable>
        <Text style={styles.note}>
          Simulated sign-in — nothing leaves this device in the prototype.
        </Text>
      </Card>

      <Text style={styles.footer}>
        Molehill · no guilt timers, streaks, or shame mechanics
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 24,
    paddingTop: 72,
    gap: 26,
  },
  hero: { gap: 14 },
  title: {
    fontFamily: fonts.sansExtra,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.2,
    color: colors.ink,
  },
  lead: {
    fontFamily: fonts.bodyLight,
    fontSize: 16.5,
    lineHeight: 25,
    color: colors.inkSoft,
    maxWidth: 340,
  },
  panel: { gap: 12 },
  panelTitle: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 2,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
  },
  oauthBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
  },
  oauthGlyph: {
    fontFamily: fonts.sansExtra,
    fontSize: 18,
    color: colors.accentInk,
    width: 22,
    textAlign: "center",
  },
  oauthLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15.5,
    color: colors.ink,
  },
  note: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
  },
  footer: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: "auto",
    paddingBottom: 20,
  },
});
