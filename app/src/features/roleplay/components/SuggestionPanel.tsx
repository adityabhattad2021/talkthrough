import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import type { RefObject } from "react";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

import type { Suggestion } from "../model/types";

type SuggestionPanelProps = {
  suggestions: Suggestion[];
  scrollViewRef: RefObject<ScrollView | null>;
};

export function SuggestionPanel({
  suggestions,
  scrollViewRef,
}: SuggestionPanelProps) {
  const suggestionOpacity = useRef(new Animated.Value(0)).current;
  const suggestionTranslateY = useRef(new Animated.Value(10)).current;
  const suggestionsTopRef = useRef(0);

  useEffect(() => {
    if (!suggestions.length) {
      suggestionOpacity.setValue(0);
      suggestionTranslateY.setValue(10);
      return;
    }

    suggestionOpacity.setValue(0);
    suggestionTranslateY.setValue(10);
    Animated.parallel([
      Animated.timing(suggestionOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(suggestionTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, suggestionsTopRef.current - spacing[4]),
        animated: true,
      });
    }, 180);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [scrollViewRef, suggestionOpacity, suggestionTranslateY, suggestions]);

  if (!suggestions.length) {
    return null;
  }

  function handleLayout(event: LayoutChangeEvent) {
    suggestionsTopRef.current = event.nativeEvent.layout.y;
  }

  return (
    <View style={styles.card} onLayout={handleLayout}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TRY SAYING</Text>
        <Text style={styles.status}>{`${suggestions.length} ideas`}</Text>
      </View>

      <Animated.View
        style={{
          opacity: suggestionOpacity,
          transform: [{ translateY: suggestionTranslateY }],
        }}
      >
        {suggestions.map((suggestion, index) => (
          <View
            key={`${suggestion.romanized}-${index}`}
            style={styles.suggestionOption}
          >
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.romanized}>{suggestion.romanized}</Text>
              <Text style={styles.english}>{suggestion.english}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.sage200,
    borderWidth: 1,
    borderColor: colors.borderSoft,
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
    color: colors.ink,
    letterSpacing: 1.2,
  },
  status: {
    ...typography.micro,
    color: colors.ash,
  },
  suggestionOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
    backgroundColor: colors.paper,
    borderRadius: 16,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    marginBottom: spacing[2],
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.sage700,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  numberText: {
    ...typography.micro,
    color: colors.paper,
  },
  copy: {
    flex: 1,
    gap: spacing[1],
  },
  romanized: {
    ...typography.body,
    color: colors.ink,
  },
  english: {
    ...typography.caption,
    color: colors.slate,
    lineHeight: 20,
  },
});
