import { TextStyle } from "react-native";

import { colors } from "./colors";

export const fontFamilies = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
} as const;

export const typography = {
  display: {
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -0.64,
    color: colors.ink,
  } satisfies TextStyle,
  heading: {
    fontFamily: fontFamilies.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.33,
    color: colors.ink,
  } satisfies TextStyle,
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.17,
    color: colors.ink,
  } satisfies TextStyle,
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.slate,
  } satisfies TextStyle,
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.fog,
  } satisfies TextStyle,
  micro: {
    fontFamily: fontFamilies.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    color: colors.ash,
    textTransform: "uppercase",
  } satisfies TextStyle,
} as const;
