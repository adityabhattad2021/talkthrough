import {
  CarFront,
  CupSoda,
  HeartPulse,
  House,
  ShoppingBasket,
  Stethoscope,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";

import { ScenarioGlyph as ScenarioGlyphType } from "../model/types";

const GLYPH_ICONS: Record<ScenarioGlyphType, typeof CarFront> = {
  auto: CarFront,
  chai: CupSoda,
  sabzi: ShoppingBasket,
  pharm: HeartPulse,
  phone: House,
  doc: Stethoscope,
};

type ScenarioGlyphProps = {
  glyph: ScenarioGlyphType;
  emphasized?: boolean;
};

export function ScenarioGlyph({
  glyph,
  emphasized = false,
}: ScenarioGlyphProps) {
  const Icon = GLYPH_ICONS[glyph];
  const iconColor = emphasized ? colors.sage700 : colors.ink;

  return (
    <View
      style={[
        styles.container,
        emphasized ? styles.containerEmphasized : styles.containerDefault,
      ]}
    >
      <Icon color={iconColor} size={18} strokeWidth={1.7} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  containerDefault: {
    backgroundColor: colors.bone,
  },
  containerEmphasized: {
    backgroundColor: colors.sage50,
  },
});
