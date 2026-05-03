import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { fontFamilies, typography } from "@/theme/typography";

import { DifficultyId, DifficultyOption, ScenarioSummary } from "../model/types";
import { BottomSheet } from "./BottomSheet";
import { DifficultyPicker } from "./DifficultyPicker";

type ScenarioSheetProps = {
  difficultyId: DifficultyId;
  difficultyOptions: DifficultyOption[];
  onBegin: (payload: {
    difficultyId: DifficultyId;
    scenarioId: ScenarioSummary["id"];
  }) => void;
  onClose: () => void;
  onSelectDifficulty: (difficultyId: DifficultyId) => void;
  scenario: ScenarioSummary | null;
  visible: boolean;
};

export function ScenarioSheet({
  difficultyId,
  difficultyOptions,
  onBegin,
  onClose,
  onSelectDifficulty,
  scenario,
  visible,
}: ScenarioSheetProps) {
  if (!scenario) {
    return null;
  }

  return (
    <BottomSheet onClose={onClose} visible={visible}>
      <View style={styles.content}>
        <Text style={styles.title}>{scenario.title}</Text>
        <Text style={styles.blurb}>{scenario.blurb}</Text>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>You&apos;ll meet</Text>
            <Text style={styles.metaValue}>{scenario.characterRole}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Length</Text>
            <Text style={styles.metaValue}>{scenario.estimatedMinutes}</Text>
          </View>
        </View>

        <DifficultyPicker
          onSelect={onSelectDifficulty}
          options={difficultyOptions}
          selectedId={difficultyId}
        />

        <Pressable
          onPress={() => onBegin({ difficultyId, scenarioId: scenario.id })}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Begin on {difficultyId}</Text>
        </Pressable>

        <Pressable onPress={onClose} style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>Not now</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  blurb: {
    ...typography.body,
  },
  content: {
    gap: spacing[4],
  },
  ghostButton: {
    alignItems: "center",
    paddingTop: 14,
  },
  ghostButtonText: {
    ...typography.body,
    color: colors.fog,
  },
  metaCard: {
    backgroundColor: colors.bone,
    borderRadius: radius.md,
    gap: spacing[2],
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.fog,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaValue: {
    ...typography.caption,
    color: colors.ink,
    fontFamily: fontFamilies.medium,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.sage500,
    borderRadius: radius.md,
    height: 56,
    justifyContent: "center",
    marginTop: spacing[2],
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.ink,
    fontFamily: fontFamilies.medium,
    textTransform: "capitalize",
  },
  title: {
    ...typography.heading,
  },
});
