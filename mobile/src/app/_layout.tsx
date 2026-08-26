import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { colors } from "@/theme/colors";
import { fontMap } from "@/theme/fonts";
import { StoreProvider, useStore } from "@/store/app-store";

function Routes() {
  const { user } = useStore();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="vision/[id]" />
      <Stack.Screen name="login" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts(fontMap);
  if (!loaded) return null;
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Routes />
    </StoreProvider>
  );
}
