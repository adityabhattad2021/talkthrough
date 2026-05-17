import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Dot } from "lucide-react-native";
import { TransportStateEnum } from "@pipecat-ai/client-js";

import { useRoleplaySession } from "@/lib/pipecat/useRoleplaySession";
import { buildServerUrl, getServerUrl } from "@/lib/server";
import { LiveWaveform } from "@/features/roleplay/components/Waveform";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type ScenarioDetail = {
  id: string;
  title: string;
  characterName: string;
  characterRole: string;
  selectedDifficultyId: string;
  selectedLanguageId: string;
};

const EMPTY_SCENARIO: ScenarioDetail = {
  id: "",
  title: "Loading scenario...",
  characterName: "Loading",
  characterRole: "",
  selectedDifficultyId: "medium",
  selectedLanguageId: "marathi",
};

function getStatusLabel(
  uiState: ReturnType<typeof useRoleplaySession>["state"]["uiState"],
): string {
  switch (uiState) {
    case "connecting":
      return "connecting";
    case "listening":
      return "listening";
    case "speaking":
      return "speaking";
    case "disconnecting":
      return "disconnecting";
    case "disconnected":
      return "disconnected";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

export default function RoleplayScreen() {
  const { state, connect, disconnect } = useRoleplaySession();
  const router = useRouter();
  const { id, difficultyId, languageId } = useLocalSearchParams<{
    id: string;
    difficultyId?: string;
    languageId?: string;
  }>();
  const [timer, setTimer] = useState(0);
  const [scenario, setScenario] = useState<ScenarioDetail>(EMPTY_SCENARIO);
  const [isLoadingScenario, setIsLoadingScenario] = useState(true);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const translationOpacity = useRef(new Animated.Value(0)).current;
  const translationTranslateY = useRef(new Animated.Value(8)).current;
  const placeholderOpacity = useRef(new Animated.Value(0.55)).current;
  const suggestionOpacity = useRef(new Animated.Value(0)).current;
  const suggestionTranslateY = useRef(new Animated.Value(10)).current;
  const suggestionsTopRef = useRef(0);
  const { height: windowHeight } = useWindowDimensions();

  const selectedDifficultyId = difficultyId ?? "medium";
  const selectedLanguageId = languageId ?? "marathi";

  useEffect(() => {
    setTimer(0);
  }, [id, selectedDifficultyId, selectedLanguageId]);

  useEffect(() => {
    let isMounted = true;

    async function loadScenario() {
      if (!id) {
        return;
      }

      setIsLoadingScenario(true);

      const response = await fetch(
        buildServerUrl(
          `/app/scenarios/${id}?language_id=${selectedLanguageId}&difficulty_id=${selectedDifficultyId}`,
        ),
      );
      const payload = (await response.json()) as ScenarioDetail;

      if (!isMounted) {
        return;
      }

      setScenario(payload);
      setIsLoadingScenario(false);
    }

    void loadScenario();

    return () => {
      isMounted = false;
    };
  }, [id, selectedDifficultyId, selectedLanguageId]);

  useEffect(() => {
    if (!id) {
      return;
    }

    void connect({
      serverUrl: getServerUrl(),
      scenarioId: id,
      languageId: selectedLanguageId,
      difficultyId: selectedDifficultyId,
    });
  }, [id, selectedDifficultyId, selectedLanguageId]);

  useEffect(() => {
    const isLive =
      state.transportState === TransportStateEnum.CONNECTED ||
      state.transportState === TransportStateEnum.READY;

    if (!isLive) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (timerIntervalRef.current) {
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((current) => current + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [state.transportState]);

  useEffect(() => {
    if (state.translation) {
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

    if (!state.isBotSpeaking) {
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
    placeholderOpacity,
    state.isBotSpeaking,
    state.translation,
    suggestionOpacity,
    suggestionTranslateY,
    translationOpacity,
    translationTranslateY,
  ]);

  useEffect(() => {
    if (!state.suggestions.length) {
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
  }, [state.suggestions, suggestionOpacity, suggestionTranslateY]);

  const streamedBotLine = useMemo(() => {
    return state.currentBotText || state.latestBotLine || "";
  }, [state.currentBotText, state.latestBotLine]);

  const compactLayout = windowHeight < 780;
  const waveformHeight = compactLayout ? 156 : 220;

  const statusLabel = state.error
    ? "error"
    : isLoadingScenario
      ? "loading"
      : getStatusLabel(state.uiState);

  function handleDisconnect() {
    void disconnect().finally(() => {
      router.replace("/home");
    });
    setTimer(0);
  }

  function formatTime(value: number) {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function handleSuggestionsLayout(event: LayoutChangeEvent) {
    suggestionsTopRef.current = event.nativeEvent.layout.y;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerSide} />

        <View style={styles.headerCenter}>
          <Text style={styles.title}>{scenario.title}</Text>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>

        <View style={styles.headerSide}>
          <Pressable onPress={handleDisconnect}>
            <Text style={styles.exitText}>End</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.waveformWrap}>
          <LiveWaveform
            active={state.isBotSpeaking}
            processing={state.uiState === "connecting"}
            level={state.remoteAudioLevel}
            barColor={state.isBotSpeaking ? colors.sage700 : colors.ash}
            barWidth={12}
            height={waveformHeight}
            barRadius={40}
          />
        </View>

        <View style={styles.agentStatusContainer}>
          <Text style={styles.agentName}>{scenario.characterName}</Text>
          <Text style={styles.agentRole}>{scenario.characterRole}</Text>

          <View style={styles.agentStatusPill}>
            <Dot
              size={16}
              color={
                state.error
                  ? colors.error
                  : state.isBotSpeaking
                    ? colors.sage700
                    : colors.ink
              }
            />
            <Text style={styles.agentStatusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.transcriptArea}>
          <Text style={[styles.liveLine, compactLayout && styles.liveLineCompact]}>
            {streamedBotLine || "Waiting for the conversation to begin..."}
          </Text>

          <View style={styles.translationCard}>
            <View style={styles.translationHeader}>
              <Text style={styles.translationEyebrow}>ENGLISH</Text>
              <Text style={styles.translationStatus}>
                {state.translation
                  ? "live"
                  : state.isBotSpeaking
                    ? "translating..."
                    : "standby"}
              </Text>
            </View>

            {state.translation ? (
              <Animated.Text
                style={[
                  styles.translationLine,
                  {
                    opacity: translationOpacity,
                    transform: [{ translateY: translationTranslateY }],
                  },
                ]}
              >
                {state.translation}
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

          {state.suggestions.length ? (
            <View style={styles.suggestionsCard} onLayout={handleSuggestionsLayout}>
              <View style={styles.translationHeader}>
                <Text style={styles.suggestionEyebrow}>TRY SAYING</Text>
                <Text style={styles.translationStatus}>
                  {`${state.suggestions.length} ideas`}
                </Text>
              </View>

              <Animated.View
                style={{
                  opacity: suggestionOpacity,
                  transform: [{ translateY: suggestionTranslateY }],
                }}
              >
                {state.suggestions.map((suggestion, index) => (
                  <View
                    key={`${suggestion.romanized}-${index}`}
                    style={styles.suggestionOption}
                  >
                    <View style={styles.suggestionNumberBadge}>
                      <Text style={styles.suggestionNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.suggestionCopy}>
                      <Text style={styles.suggestionRomanized}>
                        {suggestion.romanized}
                      </Text>
                      <Text style={styles.suggestionEnglish}>
                        {suggestion.english}
                      </Text>
                    </View>
                  </View>
                ))}
              </Animated.View>
            </View>
          ) : null}

          {state.error ? (
            <Text style={styles.errorText}>{state.error}</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.sage50,
  },
  content: {
    paddingBottom: spacing[8],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    backgroundColor: colors.sage50,
  },
  headerSide: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
    gap: spacing[1],
  },
  title: {
    ...typography.title,
    textAlign: "center",
  },
  timerText: {
    ...typography.caption,
  },
  exitText: {
    ...typography.title,
    color: colors.sage700,
  },
  waveformWrap: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[3],
  },
  agentStatusContainer: {
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[6],
    marginTop: spacing[2],
  },
  agentName: {
    ...typography.heading,
  },
  agentRole: {
    ...typography.caption,
    textAlign: "center",
  },
  agentStatusPill: {
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
  agentStatusText: {
    ...typography.micro,
    color: colors.ink,
  },
  transcriptArea: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  liveLine: {
    ...typography.heading,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 34,
  },
  liveLineCompact: {
    fontSize: 20,
    lineHeight: 26,
  },
  translationCard: {
    borderRadius: 20,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  translationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  translationEyebrow: {
    ...typography.micro,
    color: colors.sage700,
    letterSpacing: 1.2,
  },
  suggestionEyebrow: {
    ...typography.micro,
    color: colors.ink,
    letterSpacing: 1.2,
  },
  translationStatus: {
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
  suggestionsCard: {
    borderRadius: 20,
    backgroundColor: colors.sage200,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[3],
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
  suggestionNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.sage700,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  suggestionNumberText: {
    ...typography.micro,
    color: colors.paper,
  },
  suggestionCopy: {
    flex: 1,
    gap: spacing[1],
  },
  suggestionRomanized: {
    ...typography.body,
    color: colors.ink,
  },
  suggestionEnglish: {
    ...typography.caption,
    color: colors.slate,
    lineHeight: 20,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
  },
});
