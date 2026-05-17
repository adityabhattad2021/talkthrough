import { StyleSheet, Text, View } from "react-native";
import { Dot } from "lucide-react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type AgentStatusSectionProps = {
  name: string;
  role: string;
  statusLabel: string;
  isBotSpeaking: boolean;
  hasError: boolean;
};

export function AgentStatusSection({
  name,
  role,
  statusLabel,
  isBotSpeaking,
  hasError,
}: AgentStatusSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.role}>{role}</Text>

      <View style={styles.statusPill}>
        <Dot
          size={16}
          color={
            hasError
              ? colors.error
              : isBotSpeaking
                ? colors.sage700
                : colors.ink
          }
        />
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[6],
    marginTop: spacing[2],
  },
  name: {
    ...typography.heading,
  },
  role: {
    ...typography.caption,
    textAlign: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.paper,
    borderRadius: 999,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  statusText: {
    ...typography.micro,
    color: colors.ink,
  },
});
