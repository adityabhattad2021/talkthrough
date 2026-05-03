import { Flame, Settings2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { fontFamilies, typography } from "@/theme/typography";

type HomeHeaderProps = {
  firstName: string;
  streakCount: number;
  onPressSettings: () => void;
};

export function HomeHeader({
  firstName,
  streakCount,
  onPressSettings,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Talkthrough</Text>
        <Text style={styles.greeting}>Namaste, {firstName}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.streakPill}>
          <Flame color={colors.sage500} size={18} strokeWidth={1.7} />
          <Text style={styles.streakValue}>{streakCount}</Text>
        </View>

        <Pressable
          accessibilityLabel="Open settings"
          onPress={onPressSettings}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
        >
          <Settings2 color={colors.ink} size={26} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing[4],
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.sage50,
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
  },
  copy: {
    gap: spacing[1],
  },
  eyebrow: {
    ...typography.micro,
  },
  greeting: {
    ...typography.heading,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  settingsButton: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  streakPill: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  streakValue: {
    ...typography.body,
    color: colors.ink,
    fontFamily: fontFamilies.medium,
  },
});
