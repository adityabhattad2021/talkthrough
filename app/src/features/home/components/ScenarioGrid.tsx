import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

import { ScenarioId, ScenarioSummary } from "../model/types";
import { ScenarioTile } from "./ScenarioTile";

type ScenarioGridProps = {
  onPressScenario: (scenario: ScenarioSummary) => void;
  recommendedScenarioId?: ScenarioId;
  scenarios: ScenarioSummary[];
};

export function ScenarioGrid({
  onPressScenario,
  recommendedScenarioId,
  scenarios,
}: ScenarioGridProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = spacing[4] * 2;
  const interColumnGap = spacing[3];
  const availableWidth = width - horizontalPadding;
  const columnCount = availableWidth >= 720 ? 3 : 2;
  const cellWidth =
    (availableWidth - interColumnGap * (columnCount - 1)) / columnCount;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>All scenarios</Text>

      <View style={styles.grid}>
        {scenarios.map((scenario, index) => (
          <View key={scenario.id} style={[styles.cell, { width: cellWidth }]}>
            <ScenarioTile
              index={index}
              isRecommended={scenario.id === recommendedScenarioId}
              onPress={onPressScenario}
              scenario={scenario}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {},
  container: {
    gap: spacing[3],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    justifyContent: "space-between",
  },
  label: {
    ...typography.micro,
    color: colors.ash,
    paddingHorizontal: 4,
  },
});
