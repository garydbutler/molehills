/*
  Capture screen — framework placeholder for the core flow:
  photo of a space / description of a goal → end state → small tasks.
*/
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export default function Capture() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What are we tackling?</Text>
      <Text style={styles.body}>
        Take a photo of the space or describe your goal. The end state and
        your first small step will show up here.
      </Text>
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
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 12,
  },
});
