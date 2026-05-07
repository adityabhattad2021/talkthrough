import { ArrowRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { fontFamilies, typography } from "@/theme/typography";

import { ScenarioSummary } from "../model/types";
import { ScenarioGlyph } from "./ScenarioGlyph";

type UpNextCardProps = {
  position: number;
  scenario: ScenarioSummary;
  totalScenarios: number;
  onPress: (scenario: ScenarioSummary) => void;
};

export function UpNextCard({
  scenario,
  totalScenarios,
  onPress,
  position,
}: UpNextCardProps) {
  return (
    <Pressable
      onPress={() => onPress(scenario)}
      style={styles.container}
    >
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>
            Up next · {String(position + 1).padStart(2, "0")} of {String(
              totalScenarios,
            ).padStart(2, "0")}
          </Text>
        </View>

        <ScenarioGlyph emphasized glyph={scenario.glyph} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{scenario.title}</Text>
        <Text style={styles.blurb}>{scenario.blurb}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerMeta}>
          <Text style={styles.meta}>{scenario.estimatedMinutes}</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.meta}>with {scenario.characterName}</Text>
        </View>
        <View style={styles.flex} />
        <View style={styles.actionRow}>
          <Text style={styles.action}>Begin</Text>
          <ArrowRight color={colors.sage500} size={14} strokeWidth={1.8} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    ...typography.caption,
    color: colors.sage500,
    fontFamily: fontFamilies.medium,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.sage50,
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeDot: {
    backgroundColor: colors.sage500,
    borderRadius: radius.full,
    height: 6,
    width: 6,
  },
  badgeText: {
    ...typography.micro,
    color: colors.sage700,
  },
  blurb: {
    ...typography.body,
    color: colors.slate,
  },
  container: {
    backgroundColor: colors.paper,
    borderColor: colors.stone,
    borderRadius: radius.xl,
    borderRightColor: colors.borderSubtle,
    borderTopColor: colors.mist,
    borderWidth: 5,
    gap: spacing[4],
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  copy: {
    gap: spacing[2],
  },
  flex: {
    flex: 1,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing[2],
    justifyContent: "space-between",
  },
  footerMeta: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: "wrap",
    gap: spacing[2],
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: {
    ...typography.caption,
    color: colors.fog,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  separator: {
    ...typography.caption,
    color: colors.ash,
  },
  title: {
    ...typography.heading,
    color: colors.ink,
  },
});
