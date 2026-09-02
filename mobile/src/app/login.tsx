/*
  Login — real authentication through the Next.js backend. Google opens a
  browser session; Apple uses the native sign-in sheet. Both return a JWT.
  
  Email sign-in is local-only for quick prototype testing.
*/
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import {
  Card,
  Field,
  Kicker,
  Mascot,
  PrimaryButton,
  SerifEm,
} from "@/components/ui";
import { useStore } from "@/store/app-store";
import { API_URL, AUTH_REDIRECT_URI, PRIVACY_URL, TERMS_URL } from "@/lib/site";
import { setAuthToken, decodeJwtPayload } from "@/lib/auth-token";

type OAuthProvider = "google";

export default function Login() {
  const { user, signIn, namePromptHandled, hydrated } = useStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<OAuthProvider | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = useCallback(async (provider: OAuthProvider) => {
    setLoading(provider);
    setError(null);

    try {
      const authUrl = `${API_URL}/api/auth/mobile/start?provider=${provider}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, AUTH_REDIRECT_URI);

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
            // The API gate needs the token itself, not just its claims.
            await setAuthToken(token);
            signIn({
              name: (payload.name as string) || (payload.email as string) || "User",
              email: (payload.email as string) || "",
              provider: (payload.provider as string) || provider,
              sub: (payload.sub as string) || undefined,
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

  /* Apple's sheet is iOS-only and absent on older versions, so the button is
     rendered only where it can actually work. */
  const [appleAvailable, setAppleAvailable] = useState(false);
  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => {});
  }, []);

  const handleApple = useCallback(async () => {
    setError(null);
    setLoading("apple");
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        setError("Apple didn't return a sign-in token. Please try again.");
        return;
      }

      /* Apple gives the name exactly once, on first authorisation. Send it
         now or it is gone for good — every later sign-in returns only the id. */
      const fullName = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ]
        .filter(Boolean)
        .join(" ");

      const res = await fetch(`${API_URL}/api/auth/apple/native`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          fullName: fullName || undefined,
        }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setError(data.error || "Could not complete sign-in. Please try again.");
        return;
      }

      const payload = decodeJwtPayload(data.token);
      await setAuthToken(data.token);
      signIn({
        /* Apple returns the name only on first authorisation, so a returning
           user has none. The email's local part reads better as a greeting
           than the whole address. */
        name:
          (payload?.name as string) ||
          ((payload?.email as string) || "").split("@")[0] ||
          "Friend",
        email: (payload?.email as string) || "",
        provider: "apple",
        // The verified token carries the same Apple subject. Keep the native
        // credential as a fallback so local name storage always has its
        // stable per-user key, even if decoding the app JWT ever fails.
        sub: (payload?.sub as string) || credential.user,
      });
    } catch (e) {
      // Tapping Cancel on Apple's sheet is a decision, not a failure.
      if ((e as { code?: string }).code !== "ERR_REQUEST_CANCELED") {
        setError("Could not complete sign-in. Please try again.");
      }
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
  /* Wait for hydration, or a returning user gets asked their name again for
     the split second before storage loads. */
  if (user && hydrated) {
    return <Redirect href={namePromptHandled ? "/today" : "/name"} />;
  }
  if (user) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <Mascot pose="wave" height={88} style={styles.mascot} />
        <View style={styles.definition}>
          <View style={styles.definitionTermRow}>
            <Text style={styles.definitionTerm}>Inchmeal</Text>
            <Text style={styles.definitionPart}>adverb</Text>
          </View>
          <Text style={styles.definitionBody}>Inch by inch; little by little.</Text>
        </View>
        <Kicker>A calmer way to get things done</Kicker>
        <Text style={styles.title}>
          Big things,{"\n"}
          finished <SerifEm>gently</SerifEm>.
        </Text>
        <Text style={styles.lead}>
          Show Inchmeal where the thing stands — a photo, or one sentence. It
          writes the plan and gives you three small steps a day, never a
          fourth.
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

        {appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleBtn}
            onPress={handleApple}
          />
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

{/* Local testing only. __DEV__ is compile-time false in release
            builds, so this never ships. It mints no server token, so it
            cannot reach the API either. */}
        {__DEV__ && (
          <>
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
          </>
        )}
      </Card>

      <Text style={styles.legalNote}>
        Inchmeal is for adults 18 and over. By continuing, you agree to the{" "}
        <Text style={styles.legalLink} onPress={() => Linking.openURL(TERMS_URL)}>
          Terms
        </Text>{" "}
        and acknowledge the{" "}
        <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
          Privacy Policy
        </Text>
        .
      </Text>

      <Text style={styles.footer}>
        Little and often · no streaks, timers, or guilt trips
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: {
    flexGrow: 1,
    backgroundColor: colors.paper,
    padding: 24,
    paddingTop: 72,
    gap: 26,
  },
  hero: { gap: 14 },
  appleBtn: { height: 52, width: "100%" },
  mascot: { alignSelf: "flex-start", marginBottom: -2 },
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
  definition: {
    gap: 3,
    maxWidth: 340,
  },
  definitionTermRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  definitionTerm: {
    fontFamily: fonts.sansExtra,
    fontSize: 22,
    color: colors.ink,
  },
  definitionPart: {
    fontFamily: fonts.serifItalic,
    fontSize: 13,
    color: colors.muted,
  },
  definitionBody: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
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
  legalNote: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  legalLink: {
    fontFamily: fonts.bodySemi,
    color: colors.accentInk,
    textDecorationLine: "underline",
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
