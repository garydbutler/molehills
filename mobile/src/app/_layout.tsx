import { useCallback, useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { colors } from "@/theme/colors";
import { fontMap } from "@/theme/fonts";
import { BrandSplash } from "@/components/ui";
import { StoreProvider, useStore } from "@/store/app-store";
import {
  configurePurchases,
  logInPurchases,
  logOutPurchases,
} from "@/lib/purchases";

function Routes() {
  const { user } = useStore();
  const identified = useRef<string | null>(null);

  /* Configure once at startup — anonymously if nobody is signed in yet, so
     the SDK is ready before the first paywall. Then bind purchases to the
     account when we learn who it is. */
  useEffect(() => {
    configurePurchases();
  }, []);

  useEffect(() => {
    // Fall back to email: some providers omit `sub`, and a stable-but-imperfect
    // id still beats a per-device anonymous one for restoring a subscription.
    const id = user?.sub || user?.email;

    if (!user) {
      if (identified.current) {
        identified.current = null;
        logOutPurchases();
      }
      return;
    }

    if (id && identified.current !== id) {
      identified.current = id;
      logInPurchases(id);
    }
  }, [user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="name" />
      <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts(fontMap);
  // Full-bleed launch art over the app until it fades out. Only after fonts
  // load, so it appears already styled and covers the native colour splash.
  const [splashDone, setSplashDone] = useState(false);
  const dismissSplash = useCallback(() => setSplashDone(true), []);
  if (!loaded) return null;
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Routes />
      {!splashDone && <BrandSplash onDone={dismissSplash} />}
    </StoreProvider>
  );
}
