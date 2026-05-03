import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { fontFamilies, typography } from "@/theme/typography";

type HomeProgressIntroProps = {
  scenario: string;
};

export function HomeProgressIntro({
  scenario,
}: HomeProgressIntroProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.copy}>
        <Text style={styles.emphasis}>2 of 6 done</Text> Up next is {scenario}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing[4],
  },
  copy: {
    ...typography.caption,
    color: colors.fog,
  },
  emphasis: {
    color: colors.ink,
    fontFamily: fontFamilies.medium,
  },
});
