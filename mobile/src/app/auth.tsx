/*
  OAuth return route. `molehill://auth?token=…` is the redirect the backend
  sends the browser to after Google sign-in.

  On iOS `WebBrowser.openAuthSessionAsync` intercepts that redirect itself and
  this route never mounts. On Android the custom-scheme redirect escapes the
  auth session and arrives as a normal deep link, so this screen is where the
  token actually gets consumed. Handling it here also covers a cold start from
  the link.
*/
import { useEffect, useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { useStore } from "@/store/app-store";
import { setAuthToken, decodeJwtPayload } from "@/lib/auth-token";

export default function AuthReturn() {
  const { signIn } = useStore();
  const params = useLocalSearchParams<{
    token?: string;
    error?: string;
    message?: string;
  }>();
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (params.error) {
      setFailed(params.message || "Authentication failed. Please try again.");
      return;
    }
    const token = params.token;
    if (!token) {
      setFailed("Could not read authentication response.");
      return;
    }
    const payload = decodeJwtPayload(token);
    if (!payload) {
      setFailed("Could not read authentication response.");
      return;
    }
    (async () => {
      await setAuthToken(token);
      signIn({
        name: (payload.name as string) || (payload.email as string) || "User",
        email: (payload.email as string) || "",
        provider: (payload.provider as string) || "google",
        sub: (payload.sub as string) || undefined,
      });
      setDone(true);
    })();
  }, [params.token, params.error, params.message, signIn]);

  // signIn sets `user`; /login then bounces on to /today or /name. On failure
  // we just land back on /login so the user can retry.
  if (done || failed) return <Redirect href="/login" />;

  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.ink} />
      <Text style={styles.label}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.paper,
  },
  label: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 15,
  },
});
