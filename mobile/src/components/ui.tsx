/* Shared UI pieces styled to match references/mobiledesigh.html. */
import React from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Reanimated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";

/* ---- progress ring ---- */

export function Ring({
  pct,
  size = 96,
  stroke = 7,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.tintDeep}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.clay}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={ringStyles.center} pointerEvents="none">
        <Text style={[ringStyles.pct, { fontSize: size * 0.24 }]}>
          {clamped}%
        </Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pct: {
    fontFamily: fonts.monoMedium,
    color: colors.ink,
  },
});


/* ---- press response ----

   Apple's first rule: feedback happens on touch-DOWN, continuously, never on
   release. One critically damped spring (damping 1.0, response ~0.35) so a
   press that is grabbed and released fast is interruptible rather than
   queued. Reduced motion keeps the opacity dip and drops the scale. */

const SPRING = { dampingRatio: 1, duration: 350 } as const;

/* The Pressable IS the animated view — no wrapper. A wrapper would swallow
   any layout style the caller passes (flex, alignSelf), leaving the row's
   real child unsized. */
const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

export function Press({
  onPress,
  disabled,
  scaleTo = 0.97,
  hitSlop,
  style,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  scaleTo?: number;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : scale.get() }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => scale.set(withSpring(scaleTo, SPRING))}
      onPressOut={() => scale.set(withSpring(1, SPRING))}
      hitSlop={hitSlop}
      style={[style, animated, { opacity: disabled ? 0.4 : 1 }]}
    >
      {children}
    </AnimatedPressable>
  );
}

/* ---- text styles ---- */

export const kickerStyle: TextStyle = {
  fontFamily: fonts.monoMedium,
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: colors.muted,
};

export function Kicker({
  children,
  numberOfLines,
}: {
  children: React.ReactNode;
  /* Clamp when the content is user-derived and could be any length. */
  numberOfLines?: number;
}) {
  return (
    <Text style={kickerStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Headline({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[headlineStyles.base, style]}>{children}</Text>
  );
}

const headlineStyles = StyleSheet.create({
  base: {
    fontFamily: fonts.sansExtra,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    color: colors.ink,
    marginTop: 10,
  },
});

export function SerifEm({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: fonts.serifItalic }}>{children}</Text>;
}

/* ---- buttons ---- */

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = "solid",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline" | "quiet";
}) {
  const bg =
    variant === "solid" ? colors.accent : "transparent";
  const border =
    variant === "outline" ? 1.5 : 0;
  const fg =
    variant === "solid" ? colors.bone : colors.accentInk;
  return (
    <Press
      onPress={onPress}
      disabled={disabled}
      style={[buttonStyles.base, { backgroundColor: bg, borderWidth: border }]}
    >
      <Text style={[buttonStyles.label, { color: fg }]}>{label}</Text>
    </Press>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 26,
    alignItems: "center",
    borderColor: colors.line,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
  },
});

/* ---- chips ---- */

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Press
      onPress={onPress}
      style={[chipStyles.base, active && chipStyles.active]}
    >
      <Text
        style={[
          chipStyles.label,
          active && { color: colors.accentInk },
        ]}
      >
        {label}
      </Text>
    </Press>
  );
}

const chipStyles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dotted",
    borderColor: colors.muted,
    backgroundColor: colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  active: {
    backgroundColor: colors.tint,
    borderStyle: "solid",
    borderColor: colors.accentInk,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
});

/* ---- inputs ---- */

export function Field({
  placeholder,
  value,
  onChangeText,
  multiline,
  maxLength,
  autoFocus,
  style,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      maxLength={maxLength}
      autoFocus={autoFocus}
      style={[
        fieldStyles.base,
        multiline && fieldStyles.multiline,
        style,
      ]}
    />
  );
}

const fieldStyles = StyleSheet.create({
  base: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
});

/* ---- cards ---- */

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[cardStyles.base, style]}>{children}</View>;
}

const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 18,
  },
});

/* ---- step row ---- */

export function StepRow({
  label,
  meta,
  done,
  onPress,
}: {
  label: string;
  meta: string;
  done: boolean;
  onPress: () => void;
}) {
  const reduced = useReducedMotion();
  /* The box fills from wherever it currently is, so a fast double-tap
     reverses mid-flight instead of queueing two animations. */
  const fill = useSharedValue(done ? 1 : 0);
  React.useEffect(() => {
    fill.set(reduced ? (done ? 1 : 0) : withSpring(done ? 1 : 0, SPRING));
  }, [done, fill, reduced]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(89, 67, 191, ${fill.get()})`,
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: fill.get(),
    transform: [{ scale: 0.6 + fill.get() * 0.4 }],
  }));

  return (
    <Press
      /* Harmony: the tick, the spring and the tap land together, so the
         haptic goes on the same handler as the state change — not in an
         effect a frame later. Ticking a job is a commit; unticking is a
         correction, so it gets the lighter of the two. */
      onPress={() => {
        Haptics.impactAsync(
          done
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Medium,
        );
        onPress();
      }}
      scaleTo={0.985}
      style={stepStyles.row}
    >
      <Reanimated.View style={[stepStyles.box, boxStyle]}>
        <Reanimated.Text style={[stepStyles.check, checkStyle]}>
          {"\u2713"}
        </Reanimated.Text>
      </Reanimated.View>
      <View style={stepStyles.textWrap}>
        <Text
          style={[stepStyles.label, done && stepStyles.labelDone]}
          numberOfLines={2}
        >
          {label}
        </Text>
        <Text style={stepStyles.meta}>{meta}</Text>
      </View>
    </Press>
  );
}

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
  },
  box: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.accentInk,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    color: colors.bone,
    fontSize: 15,
    fontFamily: fonts.bodySemi,
  },
  textWrap: { flex: 1, gap: 2 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 15.5,
    color: colors.ink,
  },
  labelDone: {
    textDecorationLine: "line-through",
    color: colors.muted,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11.5,
    letterSpacing: 1,
    color: colors.muted,
  },
});

/* ---- before/after reveal ---- */

export function BeforeAfter({
  before,
  after,
  height = 220,
}: {
  before: string;
  after: string;
  height?: number;
}) {
  const [width, setWidth] = React.useState(0);
  const [x, setX] = React.useState(0);

  // ponytail: rebuilt each render so the handlers close over the current
  // width — cheaper than the bookkeeping to keep a memoized one honest.
  // setState per drag frame is fine for one slider per card; reach for
  // Animated.Value if a long Journey list starts to stutter.
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => setX(clampX(e.nativeEvent.locationX, width)),
    onPanResponderMove: (e) => setX(clampX(e.nativeEvent.locationX, width)),
  });

  return (
    <View
      style={[revealStyles.frame, { height }]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w === width) return;
        setWidth(w);
        setX(w / 2);
      }}
      {...pan.panHandlers}
    >
      {/* ponytail: every child is pointerEvents="none" so the touch target is
         always the frame — otherwise locationX flips between subviews mid-drag
         and the handle jitters. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image source={{ uri: after }} resizeMode="cover" style={{ width, height }} />
      </View>

      <View pointerEvents="none" style={[revealStyles.beforeClip, { width: x, height }]}>
        <Image source={{ uri: before }} resizeMode="cover" style={{ width, height }} />
      </View>

      <View pointerEvents="none" style={[revealStyles.handle, { left: x - 1, height }]} />
      <View pointerEvents="none" style={[revealStyles.grip, { left: x - 15, top: height / 2 - 15 }]}>
        <Text style={revealStyles.gripLabel}>‹ ›</Text>
      </View>

      <Text pointerEvents="none" style={[revealStyles.tag, revealStyles.tagLeft]}>BEFORE</Text>
      <Text pointerEvents="none" style={[revealStyles.tag, revealStyles.tagRight]}>AFTER</Text>
    </View>
  );
}

function clampX(value: number, width: number) {
  return Math.max(0, Math.min(value, width));
}

const revealStyles = StyleSheet.create({
  frame: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.tintDeep,
  },
  beforeClip: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "hidden",
  },
  handle: {
    position: "absolute",
    top: 0,
    width: 2,
    backgroundColor: colors.surface,
  },
  grip: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  gripLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.accentInk,
  },
  tag: {
    position: "absolute",
    bottom: 8,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.surface,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  tagLeft: { left: 8 },
  tagRight: { right: 8 },
});

/* ---- the done picture, catching up ----
   Version 1 of "the done picture moves": the finished image fades in over the
   before, driven by how far recapture says the project really is. Not a
   progress bar with a wallpaper — the picture itself is filling in. */

export function DonePicture({
  before,
  done,
  progress,
  height = 220,
}: {
  before?: string;
  done?: string;
  progress: number; // 0..1
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(1, progress));

  if (!before && !done) return null;

  return (
    <View style={[doneStyles.frame, { height }]}>
      {before ? (
        <Image source={{ uri: before }} resizeMode="cover" style={doneStyles.layer} />
      ) : null}
      {done ? (
        <Image
          source={{ uri: done }}
          resizeMode="cover"
          style={[doneStyles.layer, { opacity: before ? clamped : 1 }]}
        />
      ) : null}
    </View>
  );
}

const doneStyles = StyleSheet.create({
  frame: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.tintDeep,
  },
  layer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  },
});

/* ---- brand ----

   The unbig wordmark lockup: the purple mountain crumbling into small stones,
   the UNBIG wordmark with its clay-dotted "i", and the tagline. Transparent
   PNG, trimmed to the artwork (the source JPG's white padding was keyed out),
   so it sits flush on paper with no visible box. Decorative — it carries the
   brand as its alt text but is otherwise plain. */
const UNBIG_LOGO = require("../../assets/brand/unbig-logo.png");

export function BrandLogo({
  width = "100%",
  style,
}: {
  width?: number | `${number}%`;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      accessibilityLabel="unbig — make big things small enough to start"
      source={UNBIG_LOGO}
      resizeMode="contain"
      // Trimmed lockup is 662×151; aspectRatio keeps it honest at any width.
      style={[{ width, aspectRatio: 662 / 151 }, style]}
    />
  );
}

/* ---- launch splash ----

   Full-bleed launch art (the mountain crumbling into a path up to the
   wordmark). expo-splash-screen can only center a small logo, so the native
   splash is just the matching paper colour (#f8f3f0) and this covers the
   screen edge-to-edge the instant JS mounts, then fades into the app. Driven
   from the root layout; owning it in JS keeps it prebuild-proof. */
const UNBIG_SPLASH = require("../../assets/brand/unbig-splash.png");

export function BrandSplash({ onDone, hold = 1400 }: { onDone: () => void; hold?: number }) {
  const opacity = React.useRef(new Animated.Value(1)).current;
  // Explicit window size — the overlay can't rely on absoluteFill resolving to
  // the screen here (it collapses and the Image renders at intrinsic size).
  const { width, height } = useWindowDimensions();
  React.useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }).start(({ finished }) => finished && onDone());
    }, hold);
    return () => clearTimeout(t);
  }, [hold, onDone, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[splashStyles.fill, { width, height, opacity }]}
    >
      <Image
        accessibilityLabel="unbig — make big things small enough to start"
        source={UNBIG_SPLASH}
        // contain: show the whole composition (wordmark included). The art's
        // aspect is near the phone's and its background matches the fill, so
        // the thin side bars are invisible — reads full-bleed.
        resizeMode="contain"
        style={{ width, height }}
      />
    </Animated.View>
  );
}

const splashStyles = StyleSheet.create({
  // Matches the art's paper background so the contain letterbox is invisible.
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f3f0",
  },
});

/* ---- mascot ----

   The inchworm. Four poses, each with a job:
     wave     — greeting (login)
     notebook — writing the plan (while the plan is being built)
     sprout   — a small beginning, and a quiet finish
     measure  — the brand mark; also the app icon

   Decorative only, so it is hidden from screen readers. Every source is
   transparent, sized by height with the aspect ratio kept.
*/
const MASCOTS = {
  wave: require("../../assets/mascots/inchworm-peeking-wave.png"),
  notebook: require("../../assets/mascots/inchworm-field-guide.png"),
  sprout: require("../../assets/mascots/inchworm-sprout.png"),
  measure: require("../../assets/mascots/inchworm-measuring-tape.png"),
} as const;

export function Mascot({
  pose,
  height = 120,
  style,
}: {
  pose: keyof typeof MASCOTS;
  height?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      source={MASCOTS[pose]}
      resizeMode="contain"
      style={[{ height, width: "100%" }, style]}
    />
  );
}
