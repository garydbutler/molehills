/*
  Paywall — shown when the free plan allowance runs out.

  Hand-rolled rather than RevenueCat's hosted paywall: this one reads in the
  app's own voice and needs no dashboard design step. It lists whatever
  packages the current offering has, in dashboard order, so pricing changes
  without a release.

  Tone rules that are not negotiable here: no countdown, no "limited time", no
  shaming the free user. Someone who cannot pay keeps every plan they already
  made — say so plainly.
*/
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { Card, Headline, Kicker, Mascot, Press, SerifEm } from "@/components/ui";
import { getPackages, purchase, restore, hasPro } from "@/lib/purchases";
import { tell } from "@/lib/dialog";

export default function Paywall() {
  const router = useRouter();
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getPackages().then((p) => {
      if (alive) setPackages(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/today");

  const buy = async (pkg: PurchasesPackage) => {
    setBusy(true);
    const outcome = await purchase(pkg);
    setBusy(false);

    if (outcome.status === "purchased") {
      close();
      return;
    }
    // A cancel is a decision, not a failure. Say nothing.
    if (outcome.status === "error") {
      tell("That didn't go through", outcome.message);
    }
  };

  const doRestore = async () => {
    setBusy(true);
    const info = await restore();
    setBusy(false);

    if (hasPro(info)) {
      close();
      return;
    }
    tell(
      "Nothing to restore",
      "We couldn't find a subscription on this store account. If you paid with a different one, sign in to that account and try again.",
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
      <Press onPress={close} style={styles.back} hitSlop={8}>
        <Text style={styles.backLabel}>← Not now</Text>
      </Press>

      <View style={styles.header}>
        <Mascot pose="measure" height={92} />
        <Kicker>unbig in full</Kicker>
        <Headline>
          Keep going, <SerifEm>little and often</SerifEm>.
        </Headline>
        <Text style={styles.lead}>
          You&apos;ve used your free plans. A subscription gives you as many
          plans as you need — same three steps a day, same no streaks.
        </Text>
      </View>

      {packages === null ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.accentInk} />
        </View>
      ) : packages.length === 0 ? (
        /* No offering configured, or the products are still in review. Never
           dead-end — the free plans they already made still work. */
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyBody}>
            Subscriptions aren&apos;t open just yet. Everything you&apos;ve
            already planned is still here and still yours.
          </Text>
        </Card>
      ) : (
        <View style={styles.options}>
          {packages.map((pkg) => (
            <Press
              key={pkg.identifier}
              onPress={() => buy(pkg)}
              disabled={busy}
              style={[
                styles.option,
              ]}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  {pkg.product.title || pkg.identifier}
                </Text>
                {pkg.product.description ? (
                  <Text style={styles.optionMeta}>
                    {pkg.product.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.optionPrice}>{pkg.product.priceString}</Text>
            </Press>
          ))}
        </View>
      )}

      <Press onPress={doRestore} disabled={busy} hitSlop={8}>
        <Text style={styles.restore}>Restore a purchase</Text>
      </Press>

      <Text style={styles.fine}>
        Subscriptions renew until cancelled, and you can cancel any time in your
        App Store or Play Store account. Your finished projects are yours
        either way.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  page: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 48,
    gap: 20,
  },
  back: { alignSelf: "flex-start" },
  backLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.accentInk,
  },
  header: { gap: 8, alignItems: "flex-start" },
  lead: {
    fontFamily: fonts.bodyLight,
    fontSize: 15.5,
    lineHeight: 24,
    color: colors.inkSoft,
  },
  loading: { paddingVertical: 30, alignItems: "center" },
  emptyCard: { alignItems: "center", paddingVertical: 26 },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.inkSoft,
    textAlign: "center",
  },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.accentInk,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  optionText: { flex: 1, gap: 3 },
  optionTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 17,
    color: colors.ink,
  },
  optionMeta: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.muted,
  },
  optionPrice: {
    fontFamily: fonts.sansExtra,
    fontSize: 19,
    color: colors.accentInk,
  },
  restore: {
    fontFamily: fonts.bodySemi,
    fontSize: 14.5,
    color: colors.muted,
    textAlign: "center",
  },
  fine: {
    fontFamily: fonts.bodyLight,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.faint,
    textAlign: "center",
  },
});
