import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type TranslationCardProps = {
  translation: string;
  isBotSpeaking: boolean;
};

export function TranslationCard({
  translation,
  isBotSpeaking,
}: TranslationCardProps) {
  const translationOpacity = useRef(new Animated.Value(0)).current;
  const translationTranslateY = useRef(new Animated.Value(8)).current;
  const placeholderOpacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (translation) {
      placeholderOpacity.stopAnimation();
      translationOpacity.setValue(0);
      translationTranslateY.setValue(8);
      Animated.parallel([
        Animated.timing(translationOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translationTranslateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    translationOpacity.setValue(0);
    translationTranslateY.setValue(8);

    if (!isBotSpeaking) {
      placeholderOpacity.stopAnimation();
      placeholderOpacity.setValue(0.55);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(placeholderOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(placeholderOpacity, {
          toValue: 0.45,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => {
      loop.stop();
    };
  }, [
    isBotSpeaking,
    placeholderOpacity,
    translation,
    translationOpacity,
    translationTranslateY,
  ]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ENGLISH</Text>
        <Text style={styles.status}>
          {translation ? "live" : isBotSpeaking ? "translating..." : "standby"}
        </Text>
      </View>

      {translation ? (
        <Animated.Text
          style={[
            styles.translationLine,
            {
              opacity: translationOpacity,
              transform: [{ translateY: translationTranslateY }],
            },
          ]}
        >
          {translation}
        </Animated.Text>
      ) : (
        <Animated.View
          style={[styles.translationPlaceholder, { opacity: placeholderOpacity }]}
        >
          <View style={styles.placeholderLineLong} />
          <View style={styles.placeholderLineShort} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  eyebrow: {
    ...typography.micro,
    color: colors.sage700,
    letterSpacing: 1.2,
  },
  status: {
    ...typography.micro,
    color: colors.ash,
  },
  translationLine: {
    ...typography.body,
    color: colors.slate,
    textAlign: "left",
    lineHeight: 24,
  },
  translationPlaceholder: {
    gap: spacing[2],
  },
  placeholderLineLong: {
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.mist,
    width: "88%",
  },
  placeholderLineShort: {
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.mist,
    width: "62%",
  },
});
