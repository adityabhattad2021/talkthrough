import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type RoleplayHeaderProps = {
  title: string;
  timerText: string;
  onEnd: () => void;
};

export function RoleplayHeader({
  title,
  timerText,
  onEnd,
}: RoleplayHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide} />

      <View style={styles.headerCenter}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.timerText}>{timerText}</Text>
      </View>

      <View style={styles.headerSide}>
        <Pressable onPress={onEnd}>
          <Text style={styles.exitText}>End</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    backgroundColor: colors.sage50,
  },
  headerSide: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
    gap: spacing[1],
  },
  title: {
    ...typography.title,
    textAlign: "center",
  },
  timerText: {
    ...typography.caption,
  },
  exitText: {
    ...typography.title,
    color: colors.sage700,
  },
});
