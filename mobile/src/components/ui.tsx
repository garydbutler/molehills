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
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { TOUCH_MIN, lift, radii, space, type as typeScale } from "@/theme/tokens";

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
    <View
      style={{ width: size, height: size }}
      accessibilityRole="progressbar"
      accessibilityLabel={`${clamped}% complete`}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.tintDeep}
          strokeWidth={stroke}
          fill="none"
        />
        {clamped > 0 ? (
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
        ) : null}
      </Svg>
      <View
        style={ringStyles.center}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
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
  accessibilityLabel,
  accessibilityHint,
  role = "button",
  checked,
  dimWhenDisabled = true,
}: {
  onPress?: () => void;
  disabled?: boolean;
  scaleTo?: number;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /* Only needed when the visible text is not the whole story — the label
     defaults to the child text, which is usually the right answer. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  role?: "button" | "checkbox" | "link" | undefined;
  checked?: boolean;
  /* Off for controls that express "disabled" with their own colours rather
     than by fading an enabled style. */
  dimWhenDisabled?: boolean;
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
      style={[
        /* A bare text link still owes 44pt of real target; hitSlop is extra
           reach on top of that, never the target itself. */
        hitSlop != null ? pressStyles.textLink : null,
        style,
        animated,
        disabled && dimWhenDisabled ? { opacity: 0.5 } : null,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

const pressStyles = StyleSheet.create({
  textLink: {
    minHeight: TOUCH_MIN,
    justifyContent: "center",
  },
});

/* ---- text styles ---- */

export const kickerStyle: TextStyle = {
  fontFamily: fonts.monoMedium,
  ...typeScale.kicker,
  color: colors.dusk,
  textTransform: "uppercase",
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
    ...typeScale.display,
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
  /* A dimmed version of the enabled fill still reads as tappable and earns a
     dead first tap. Disabled gets its own quiet pair instead. */
  const bg = disabled
    ? colors.tint
    : variant === "solid"
      ? colors.accentInk
      : "transparent";
  const border = !disabled && variant === "outline" ? 1.5 : 0;
  const fg = disabled
    ? colors.faint
    : variant === "solid"
      ? colors.bone
      : colors.accentInk;

  return (
    <Press
      onPress={onPress}
      disabled={disabled}
      dimWhenDisabled={false}
      style={[buttonStyles.base, { backgroundColor: bg, borderWidth: border }]}
    >
      <Text style={[buttonStyles.label, { color: fg }]}>{label}</Text>
    </Press>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingVertical: 15,
    paddingHorizontal: 26,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderColor: colors.line,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
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
    ...typeScale.subhead,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.frame,
    paddingHorizontal: space.lg,
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
    borderRadius: radii.card,
    padding: 18,
  },
});

/* ---- step row ---- */

export function StepRow({
  label,
  meta,
  done,
  onPress,
  readOnly,
}: {
  label: string;
  meta: string;
  done: boolean;
  onPress: () => void;
  /* A finished project's plan is a record, not a checklist. */
  readOnly?: boolean;
}) {
  const reduced = useReducedMotion();
  /* The box fills from wherever it currently is, so a fast double-tap
     reverses mid-flight instead of queueing two animations. */
  const fill = useSharedValue(done ? 1 : 0);
  React.useEffect(() => {
    fill.set(reduced ? (done ? 1 : 0) : withSpring(done ? 1 : 0, SPRING));
  }, [done, fill, reduced]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(89, 67, 191, ${fill.get()})`, // accentInk #5943bf; RN cannot interpolate a hex in a worklet
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: fill.get(),
    transform: [{ scale: 0.6 + fill.get() * 0.4 }],
  }));

  return (
    <Press
      role={readOnly ? undefined : "checkbox"}
      checked={done}
      disabled={readOnly}
      accessibilityLabel={`${label}, ${meta}`}
      accessibilityHint={
        readOnly
          ? undefined
          : done
            ? "Double tap to undo"
            : "Double tap to complete"
      }
      /* Harmony: the tick, the spring and the tap land together, so the
         haptic goes on the same handler as the state change — not in an
         effect a frame later. Ticking a job is a commit; unticking is a
         correction, so it gets the lighter of the two. */
      onPress={() => {
        if (readOnly) return;
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
        <Text style={[stepStyles.label, done && stepStyles.labelDone]}>
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
    /* The one lifted tier in the app: today's jobs leave the page so the
       primary action is not the third identical rectangle down. */
    ...lift,
    borderRadius: radii.frame,
    padding: space.lg,
  },
  box: {
    width: 30,
    height: 30,
    borderRadius: radii.control,
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
    ...typeScale.subhead,
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
      accessibilityRole="adjustable"
      accessibilityLabel="Before and after. Drag to compare."
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
    <View
      accessibilityRole="image"
      accessibilityLabel={`Your project, ${Math.round(clamped * 100)}% of the way to done`}
      style={[doneStyles.frame, { height }]}
    >
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

/* Held long enough to actually be read — 1.4s was gone before the eye
   settled on the wordmark. 2.2s hold plus the 420ms fade. */
export function BrandSplash({ onDone, hold = 2200 }: { onDone: () => void; hold?: number }) {
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

/* ---- icons ----

   Stroked line icons in the brand purple, replacing the Apple system emoji
   that used to sit on the capture buttons — glossy 3D vendor art next to a
   faceted mountain read as two brands on one screen. Decorative: every use
   sits beside its own label. */

export function Icon({
  name,
  size = 26,
  color = colors.accentInk,
}: {
  name: "camera" | "library";
  size?: number;
  color?: string;
}) {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {name === "camera" ? (
          <>
            <Path
              d="M3 8.5A2 2 0 0 1 5 6.5h2.2l1.2-2h7.2l1.2 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke={color}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="13" r="3.6" stroke={color} strokeWidth="1.6" />
          </>
        ) : (
          <>
            <Path
              d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"
              stroke={color}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <Path
              d="M4.4 16.2l4.3-4a1.5 1.5 0 0 1 2 0l3 2.8 1.9-1.7a1.5 1.5 0 0 1 2 0l2 1.8"
              stroke={color}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="9.2" cy="9.4" r="1.4" fill={color} />
          </>
        )}
      </Svg>
    </View>
  );
}

/* ---- the mountain ----

   The brand mark is a purple faceted mountain crumbling into small stones,
   and that image is the product thesis: a big thing broken into small ones.
   It replaces the retired inchworm mascot (Inchmeal era — never reintroduce
   it) as the app's only illustrative language.

   Three states, each meaning something:
     whole    — nothing started yet
     crumbling — mid-project, the peak breaking into stones
     stones   — done; only the small pieces remain

   Drawn in SVG rather than shipped as a raster, so it takes its colour from
   the tokens and stays crisp at any size. Decorative: hidden from screen
   readers, since every use sits beside text that already says the thing.
*/

export function Mountain({
  state = "whole",
  height = 96,
  style,
}: {
  state?: "whole" | "crumbling" | "stones";
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const w = height * 1.9;
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ height, width: w, alignSelf: "center" }, style]}
    >
      <Svg width={w} height={height} viewBox="0 0 190 100">
        {state !== "stones" ? (
          <>
            {/* The massif: two faceted planes so the peak reads as solid
                rock rather than a flat triangle. */}
            <Path
              d="M8 92 L52 14 L96 92 Z"
              fill={colors.accentInk}
            />
            <Path
              d="M52 14 L96 92 L66 92 Z"
              fill={colors.accent}
            />
            <Path
              d="M52 14 L63 34 L44 44 Z"
              fill={colors.tint}
            />
          </>
        ) : null}

        {/* The stones. The mountain sheds them left to right, getting
            smaller and warmer as they go — the last one is clay, the
            colour of progress and the dot on the wordmark's "i". */}
        {state !== "whole" ? (
          <>
            <Circle cx="108" cy="84" r="9" fill={colors.accent} />
            <Circle cx="128" cy="88" r="6.5" fill={colors.tintDeep} />
            <Circle cx="145" cy="85" r="4.5" fill={colors.tintDeep} />
            <Circle cx="159" cy="89" r="3.2" fill={colors.clay} />
            <Circle cx="170" cy="86" r="2.2" fill={colors.clay} />
          </>
        ) : null}

        {/* Ground line: the path they came to rest on. */}
        <Path
          d="M4 95 L186 95"
          stroke={colors.tintDeep}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
