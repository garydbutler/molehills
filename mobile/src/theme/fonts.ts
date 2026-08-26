/*
  Font tokens — mirrors the type stack in references/mobiledesigh.html:
  Playfair Display (serif italics), Inter Tight (headings), Inter (body),
  IBM Plex Mono (labels). Loaded once in the root layout.
*/
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  InterTight_600SemiBold,
  InterTight_700Bold,
  InterTight_800ExtraBold,
} from "@expo-google-fonts/inter-tight";
import {
  PlayfairDisplay_500Medium,
  PlayfairDisplay_500Medium_Italic,
} from "@expo-google-fonts/playfair-display";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";

export const fontMap = {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  InterTight_600SemiBold,
  InterTight_700Bold,
  InterTight_800ExtraBold,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_500Medium_Italic,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
};

export const fonts = {
  serif: "PlayfairDisplay_500Medium",
  serifItalic: "PlayfairDisplay_500Medium_Italic",
  sans: "InterTight_700Bold",
  sansSemi: "InterTight_600SemiBold",
  sansExtra: "InterTight_800ExtraBold",
  body: "Inter_400Regular",
  bodyLight: "Inter_300Light",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  mono: "IBMPlexMono_400Regular",
  monoMedium: "IBMPlexMono_500Medium",
} as const;
