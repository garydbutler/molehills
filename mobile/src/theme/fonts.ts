/*
  Font tokens — mirrors the type stack in web/src/app/layout.tsx:
  Caveat (handwritten asides), Montserrat (headings/wordmark),
  Nunito Sans (body), IBM Plex Mono (labels). Loaded once in the root layout.
*/
import {
  NunitoSans_300Light,
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
} from "@expo-google-fonts/nunito-sans";
import {
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import {
  Caveat_500Medium,
  Caveat_600SemiBold,
} from "@expo-google-fonts/caveat";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";

export const fontMap = {
  NunitoSans_300Light,
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Caveat_500Medium,
  Caveat_600SemiBold,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
};

export const fonts = {
  // Caveat has no italic face — `serifItalic` keeps its name so call sites
  // don't churn; both slots now resolve to the handwritten voice.
  serif: "Caveat_500Medium",
  serifItalic: "Caveat_600SemiBold",
  sans: "Montserrat_700Bold",
  sansSemi: "Montserrat_600SemiBold",
  sansExtra: "Montserrat_800ExtraBold",
  body: "NunitoSans_400Regular",
  bodyLight: "NunitoSans_300Light",
  bodyMedium: "NunitoSans_500Medium",
  bodySemi: "NunitoSans_600SemiBold",
  mono: "IBMPlexMono_400Regular",
  monoMedium: "IBMPlexMono_500Medium",
} as const;
