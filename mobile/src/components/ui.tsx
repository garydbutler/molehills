/* Shared UI pieces styled to match references/mobiledesigh.html. */
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
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

/* ---- text styles ---- */

export const kickerStyle: TextStyle = {
  fontFamily: fonts.monoMedium,
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: colors.muted,
};

export function Kicker({ children }: { children: React.ReactNode }) {
  return <Text style={kickerStyle}>{children}</Text>;
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
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        buttonStyles.base,
        { backgroundColor: bg, borderWidth: border, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[buttonStyles.label, { color: fg }]}>{label}</Text>
    </Pressable>
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
    <Pressable
      onPress={onPress}
      style={[
        chipStyles.base,
        active && chipStyles.active,
      ]}
    >
      <Text
        style={[
          chipStyles.label,
          active && { color: colors.accentInk },
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
  style,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        stepStyles.row,
        pressed && { opacity: 0.6 },
      ]}
    >
      <View
        style={[
          stepStyles.box,
          done && stepStyles.boxDone,
        ]}
      >
        {done ? (
          <Text style={stepStyles.check}>{"\u2713"}</Text>
        ) : (
          <View style={stepStyles.dot} />
        )}
      </View>
      <View style={stepStyles.textWrap}>
        <Text
          style={[stepStyles.label, done && stepStyles.labelDone]}
          numberOfLines={2}
        >
          {label}
        </Text>
        <Text style={stepStyles.meta}>{meta}</Text>
      </View>
    </Pressable>
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
  boxDone: {
    backgroundColor: colors.accentInk,
  },
  check: {
    color: colors.bone,
    fontSize: 15,
    fontFamily: fonts.bodySemi,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tintDeep,
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
