/*
  Login — real OAuth via Auth.js on the Next.js backend. Google and Facebook
  open a browser session; on success, the backend redirects back with a JWT.
  
  Email sign-in is local-only for quick prototype testing.
*/
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useState, useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
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

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://molehills.vercel.app";
const REDIRECT_URI = "molehill://auth";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

type OAuthProvider = "google" | "facebook";

export default function Login() {
  const { user, signIn } = useStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = useCallback(async (provider: OAuthProvider) => {
    setLoading(provider);
    setError(null);

    try {
      const authUrl = `${API_URL}/api/auth/mobile/start?provider=${provider}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

      if (result.type === "cancel" || result.type === "dismiss") {
        setLoading(null);
        return;
      }

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const token = url.searchParams.get("token");
        const errorParam = url.searchParams.get("error");
        const errorMessage = url.searchParams.get("message");

        if (errorParam) {
          setError(errorMessage || "Authentication failed. Please try again.");
          setLoading(null);
          return;
        }

        if (token) {
          const payload = decodeJwtPayload(token);
          if (payload) {
            signIn({
              name: (payload.name as string) || (payload.email as string) || "User",
              email: (payload.email as string) || "",
              provider: (payload.provider as string) || provider,
            });
            return;
          }
        }

        setError("Could not read authentication response.");
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }, [signIn]);

  const handleEmailSignIn = useCallback(() => {
    signIn({
      name: email.trim().split("@")[0] || "Tester",
      email: email.trim() || "test@local.dev",
      provider: "email",
    });
  }, [email, signIn]);

  // All hooks are above this line — the redirect must not gate any of them.
  if (user) return <Redirect href="/today" />;

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
        <Text style={styles.panelTitle}>Sign in</Text>

        <Pressable
          onPress={() => handleOAuth("google")}
          disabled={loading !== null}
          style={({ pressed }) => [
            styles.oauthBtn,
            (pressed || loading === "google") && { opacity: 0.7 },
          ]}
        >
          {loading === "google" ? (
            <ActivityIndicator size="small" color={colors.accentInk} style={{ width: 22 }} />
          ) : (
            <Text style={styles.oauthGlyph}>G</Text>
          )}
          <Text style={styles.oauthLabel}>Continue with Google</Text>
        </Pressable>

        <Pressable
          onPress={() => handleOAuth("facebook")}
          disabled={loading !== null}
          style={({ pressed }) => [
            styles.oauthBtn,
            (pressed || loading === "facebook") && { opacity: 0.7 },
          ]}
        >
          {loading === "facebook" ? (
            <ActivityIndicator size="small" color="#3b5998" style={{ width: 22 }} />
          ) : (
            <Text style={[styles.oauthGlyph, { color: "#3b5998" }]}>f</Text>
          )}
          <Text style={styles.oauthLabel}>Continue with Facebook</Text>
        </Pressable>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Field
          placeholder="Email (local testing only)"
          value={email}
          onChangeText={setEmail}
        />
        <PrimaryButton
          label="Continue with email (local)"
          onPress={handleEmailSignIn}
        />
        <Text style={styles.note}>
          Email sign-in is for local testing only — it does not verify your address.
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
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "#c53030",
    textAlign: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff5f5",
    borderRadius: 8,
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
