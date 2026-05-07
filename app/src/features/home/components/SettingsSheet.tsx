import { X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { BottomSheet } from "./BottomSheet";

type SettingsSheetProps = {
  onClose: () => void;
  visible: boolean;
};

export function SettingsSheet({ onClose, visible }: SettingsSheetProps) {
  return (
    <BottomSheet onClose={onClose} visible={visible}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Pressable
            accessibilityLabel="Close settings"
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <X color={colors.ink} size={16} strokeWidth={1.8} />
          </Pressable>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Nothing here yet.</Text>
          <Text style={styles.placeholderBody}>
            We&apos;ll add practice and profile settings once those flows are defined.
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: "center",
    backgroundColor: colors.bone,
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  content: {
    gap: spacing[4],
    minHeight: 280,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  placeholder: {
    backgroundColor: colors.paper,
    borderColor: colors.mist,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing[2],
    padding: 20,
  },
  placeholderBody: {
    ...typography.body,
  },
  placeholderTitle: {
    ...typography.title,
  },
  pressed: {
    opacity: 0.8,
  },
  title: {
    ...typography.heading,
  },
});
