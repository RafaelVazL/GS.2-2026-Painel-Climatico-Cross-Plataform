import { StyleSheet } from "react-native";

export const colors = {
  background: "#0C1322",
  surface: "#141F31",
  surfaceRaised: "#1A2940",
  border: "#293A53",
  text: "#F3F7FF",
  muted: "#A9B9D0",
  accent: "#83E0F2",
  accentInk: "#102434",
  precipitation: "#AAB5FF",
  warning: "#FFDA9D",
  danger: "#FFACB0",
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const ui = StyleSheet.create({
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 27, lineHeight: 34 },
  sectionTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  label: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  body: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  small: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  card: {
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: 16,
  },
  input: {
    minHeight: 49,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  error: { color: colors.danger },
});
