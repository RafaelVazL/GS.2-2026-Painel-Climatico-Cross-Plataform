import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts } from "../styles/theme";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
};

export function ActionButton({ label, onPress, disabled = false, secondary = false }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (disabled || pressed) && styles.dimmed,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
  },
  label: { color: colors.accentInk, fontFamily: fonts.bold, fontSize: 14, textAlign: "center" },
  secondary: { backgroundColor: colors.surfaceRaised },
  secondaryLabel: { color: colors.accent },
  dimmed: { opacity: 0.55 },
});
