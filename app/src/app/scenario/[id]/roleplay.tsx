import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

  const streamedBotLine = useMemo(() => {
    return state.currentBotText || state.latestBotLine || "";
  }, [state.currentBotText, state.latestBotLine]);

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

      <View style={styles.waveformWrap}>
        <LiveWaveform
          active={state.isBotSpeaking}
          processing={state.uiState === "connecting"}
          level={state.remoteAudioLevel}
          barColor={state.isBotSpeaking ? colors.sage700 : colors.ash}
          barWidth={12}
          height={220}
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
        <Text style={styles.liveLine}>
          {streamedBotLine || "Waiting for the conversation to begin..."}
        </Text>

        <Text style={styles.translationLine}>
          {state.translation || "English translation will appear here."}
        </Text>

        {state.error ? (
          <Text style={styles.errorText}>{state.error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.sage50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
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
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  liveLine: {
    ...typography.heading,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 34,
  },
  translationLine: {
    ...typography.body,
    color: colors.fog,
    textAlign: "center",
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
  },
});
