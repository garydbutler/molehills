/*
  Settings — the small pile of things Apple requires to be reachable, plus
  sign out.

  Two of these are launch blockers rather than conveniences. Guideline 3.1.1
  wants Restore Purchases visible somewhere a returning subscriber can find
  it without being sold to again, which is why it lives here and not only on
  the paywall. Guideline 5.1.1(v) requires in-app account deletion.
*/
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { Card, Headline, Kicker, SerifEm } from "@/components/ui";
import { useStore } from "@/store/app-store";
import { deleteAccount } from "@/lib/api";
import { restore, hasPro } from "@/lib/purchases";
import { PRIVACY_URL, SUPPORT_URL, TERMS_URL } from "@/lib/site";
import { ask, tell } from "@/lib/dialog";

export default function Settings() {
  const router = useRouter();
  const { user, signOut, wipeLocalData, projects } = useStore();
  const [busy, setBusy] = useState<"restore" | "delete" | null>(null);

  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/today");

  const handleRestore = async () => {
    setBusy("restore");
    const info = await restore();
    setBusy(null);
    if (info && hasPro(info)) {
      tell("You're all set", "Your subscription is active on this device.");
    } else {
      // Not an error: most people tapping this simply never subscribed.
      tell(
        "Nothing to restore",
        "We didn't find a subscription on this Apple ID. If you subscribed with a different one, sign in to that one and try again.",
      );
    }
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/login");
  };

  const handleDelete = async () => {
    const choice = await ask(
      "Delete your account?",
      `This removes your account and erases the ${projects.length} project${
        projects.length === 1 ? "" : "s"
      } on this phone. It cannot be undone.\n\nA paid subscription is billed by Apple and is not cancelled by this — cancel it in Settings › Apple ID › Subscriptions.`,
      // options[0] is the confirm action; see lib/dialog.
      ["Delete", "Keep my account"],
    );
    if (choice !== 0) return;

    setBusy("delete");
    try {
      await deleteAccount();
      await wipeLocalData();
      router.replace("/login");
    } catch (e) {
      setBusy(null);
      tell(
        "Couldn't delete your account",
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Kicker>Settings</Kicker>
        <Headline>
          Your <SerifEm>account</SerifEm>.
        </Headline>
        {user?.email ? (
          <Text style={styles.lead}>Signed in as {user.email}</Text>
        ) : null}
      </View>

      <Card style={styles.panel}>
        <Row
          label="Your name"
          hint={user?.name ? `We call you ${user.name}` : "Tell us what to call you"}
          onPress={() =>
            router.push({ pathname: "/name", params: { source: "settings" } })
          }
        />
        <Row
          label="Restore purchases"
          hint="Already subscribed? Bring it back on this device."
          onPress={handleRestore}
          busy={busy === "restore"}
        />
        <Row label="Privacy policy" onPress={() => Linking.openURL(PRIVACY_URL)} />
        <Row label="Terms of service" onPress={() => Linking.openURL(TERMS_URL)} />
        <Row
          label="Help and support"
          hint="Accounts, subscriptions, and contact information."
          onPress={() => Linking.openURL(SUPPORT_URL)}
        />
        <Row label="Sign out" onPress={handleSignOut} />
      </Card>

      <Card style={styles.panel}>
        <Row
          label="Delete account"
          hint="Removes your account and everything on this phone."
          onPress={handleDelete}
          busy={busy === "delete"}
          destructive
        />
      </Card>

      <Pressable onPress={close} hitSlop={8} style={styles.done}>
        <Text style={styles.doneLabel}>Done</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({
  label,
  hint,
  onPress,
  busy,
  destructive,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
  busy?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, destructive && { color: colors.clay }]}>
          {label}
        </Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      {busy ? <ActivityIndicator size="small" color={colors.muted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: { padding: 24, paddingTop: 72, gap: 22, paddingBottom: 60 },
  header: { gap: 10 },
  lead: { fontFamily: fonts.sans, fontSize: 15, color: colors.muted },
  panel: { gap: 2, paddingVertical: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 12,
  },
  rowText: { flex: 1, gap: 3 },
  rowLabel: { fontFamily: fonts.sans, fontSize: 17, color: colors.ink },
  rowHint: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  done: { alignSelf: "center", paddingVertical: 12 },
  doneLabel: { fontFamily: fonts.sans, fontSize: 16, color: colors.muted },
});
