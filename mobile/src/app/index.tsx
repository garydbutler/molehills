import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { colors } from "@/theme/colors";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Welcome to</Text>
      <Text style={styles.title}>Squirrelz</Text>
      <Text style={styles.subtitle}>
        Big tasks, one small step at a time.
      </Text>
      <Link href="/capture" style={styles.button}>
        Start a task
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  kicker: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.sageDeep,
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 12,
  },
  button: {
    marginTop: 32,
    backgroundColor: colors.sageDeep,
    color: "#ffffff",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    fontSize: 16,
    fontWeight: "600",
    overflow: "hidden",
  },
});
