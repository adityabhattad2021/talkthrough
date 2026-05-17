import { useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AgentStatusSection } from "@/features/roleplay/components/AgentStatusSection";
import { useRoleplayScreenState } from "@/features/roleplay/hooks/useRoleplayScreenState";
import { LiveWaveform } from "@/features/roleplay/components/Waveform";
import { RoleplayHeader } from "@/features/roleplay/components/RoleplayHeader";
import { SuggestionPanel } from "@/features/roleplay/components/SuggestionPanel";
import { TranslationCard } from "@/features/roleplay/components/TranslationCard";
import { useSessionTimer } from "@/features/roleplay/hooks/useSessionTimer";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export default function RoleplayScreen() {
  const router = useRouter();
  const { id, difficultyId, languageId } = useLocalSearchParams<{
    id: string;
    difficultyId?: string;
    languageId?: string;
  }>();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const { height: windowHeight } = useWindowDimensions();

  const selectedDifficultyId = difficultyId ?? "medium";
  const selectedLanguageId = languageId ?? "marathi";
  const {
    scenario,
    scenarioError,
    session: state,
    streamedBotLine,
    statusLabel,
    disconnect,
  } = useRoleplayScreenState({
    scenarioId: id,
    languageId: selectedLanguageId,
    difficultyId: selectedDifficultyId,
  });
  const isLive = state.uiState === "listening" || state.uiState === "speaking";
  const { timer, resetTimer } = useSessionTimer(
    isLive,
    `${id}-${selectedDifficultyId}-${selectedLanguageId}`,
  );

  const compactLayout = windowHeight < 780;
  const waveformHeight = compactLayout ? 156 : 220;
  const scenarioTitle = scenario?.title ?? "Loading scenario...";
  const characterName = scenario?.characterName ?? "Loading";
  const characterRole = scenario?.characterRole ?? "";

  function handleDisconnect() {
    void disconnect().finally(() => {
      router.replace("/home");
    });
    resetTimer();
  }

  function formatTime(value: number) {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <RoleplayHeader
        title={scenarioTitle}
        timerText={formatTime(timer)}
        onEnd={handleDisconnect}
      />

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

        <AgentStatusSection
          name={characterName}
          role={characterRole}
          statusLabel={scenarioError ? "error" : statusLabel}
          isBotSpeaking={state.isBotSpeaking}
          hasError={Boolean(state.error || scenarioError)}
        />

        <View style={styles.transcriptArea}>
          <Text style={[styles.liveLine, compactLayout && styles.liveLineCompact]}>
            {streamedBotLine || "Waiting for the conversation to begin..."}
          </Text>

          <TranslationCard
            translation={state.translation}
            isBotSpeaking={state.isBotSpeaking}
          />

          <SuggestionPanel
            suggestions={state.suggestions}
            scrollViewRef={scrollViewRef}
          />

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
  waveformWrap: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[3],
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
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
  },
});
