import { Tabs, Redirect } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { useStore } from "@/store/app-store";

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 17,
        color: focused ? colors.accentInk : colors.muted,
        opacity: focused ? 1 : 0.75,
      }}
    >
      {glyph}
    </Text>
  );
}

export default function TabsLayout() {
  const { user } = useStore();
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accentInk,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.monoMedium,
          fontSize: 10,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => (
            <TabIcon glyph={"\u25D4"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: "Capture",
          tabBarIcon: ({ focused }) => (
            <TabIcon glyph={"\u2726"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ focused }) => (
            <TabIcon glyph={"\u273F"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="vision/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
