import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { fontFamilies, typography } from "@/theme/typography";

import { ScenarioSummary } from "../model/types";
import { ScenarioGlyph } from "./ScenarioGlyph";

type ScenarioTileProps = {
  index: number;
  isRecommended: boolean;
  onPress: (scenario: ScenarioSummary) => void;
  scenario: ScenarioSummary;
};

export function ScenarioTile({
  index,
  isRecommended,
  onPress,
  scenario,
}: ScenarioTileProps) {
  return (
    <Pressable
      onPress={() => onPress(scenario)}
      style={styles.container}
    >
      <View style={styles.header}>
        <ScenarioGlyph glyph={scenario.glyph} />
        <Text style={styles.index}>{String(index + 1).padStart(2, "0")}</Text>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{scenario.title}</Text>
        <Text style={styles.meta}>
          {scenario.bestScore ? `Best ${scenario.bestScore}%` : scenario.estimatedMinutes}
        </Text>
      </View>

      {isRecommended ? (
        <Text style={styles.recommended}>Recommended Next</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paper,
    borderColor: colors.mist,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: spacing[3],
    minHeight: 150,
    padding: 14,
  },
  copy: {
    gap: 2,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  index: {
    ...typography.micro,
    color: colors.ash,
  },
  meta: {
    ...typography.caption,
    color: colors.fog,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  recommended: {
    ...typography.micro,
    color: colors.sage500,
  },
  title: {
    ...typography.title,
    color: colors.ink,
  },
});
