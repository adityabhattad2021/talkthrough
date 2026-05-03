import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { fontFamilies, typography } from "@/theme/typography";

import { DifficultyId, DifficultyOption } from "../model/types";

type DifficultyPickerProps = {
  onSelect: (difficultyId: DifficultyId) => void;
  options: DifficultyOption[];
  selectedId: DifficultyId;
};

export function DifficultyPicker({
  onSelect,
  options,
  selectedId,
}: DifficultyPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose difficulty</Text>

      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.id === selectedId;

          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : styles.optionDefault,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.copy}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  {option.tag ? <Text style={styles.optionTag}>{option.tag}</Text> : null}
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>

              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.micro,
    color: colors.ash,
  },
  option: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionDefault: {
    backgroundColor: colors.bone,
    borderColor: "transparent",
    borderWidth: 1,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.fog,
  },
  optionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing[2],
  },
  optionSelected: {
    backgroundColor: colors.sage50,
    borderColor: colors.sage500,
  },
  optionTag: {
    ...typography.micro,
    backgroundColor: colors.paper,
    borderColor: colors.borderSubtle,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.fog,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  optionTitle: {
    ...typography.body,
    color: colors.ink,
    fontFamily: fontFamilies.medium,
  },
  options: {
    gap: 6,
  },
  pressed: {
    opacity: 0.9,
  },
  radio: {
    alignItems: "center",
    borderColor: "rgba(26, 26, 26, 0.2)",
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  radioDot: {
    backgroundColor: colors.paper,
    borderRadius: radius.full,
    height: 6,
    width: 6,
  },
  radioSelected: {
    backgroundColor: colors.sage500,
    borderColor: colors.sage500,
  },
});
