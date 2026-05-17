import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRoleplaySession } from "./hooks/useRoleplaySession";
import { ROLEPLAY_LANGUAGES, ROLEPLAY_SCENARIOS } from "./options";
import { useLocalSearchParams } from "expo-router";

function ChoiceChips({
  options,
  selectedId,
  onSelect,
}: {
  options: readonly { id: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {

  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const selected = option.id === selectedId;

        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RoleplayDebugScreen() {
  const [serverUrl, setServerUrl] = useState("http://localhost:7860");
  const [scenarioId, setScenarioId] = useState("auto-rickshaw");
  const [languageId, setLanguageId] = useState("marathi");
  const [difficultyId] = useState("medium");
  const { id } = useLocalSearchParams<{id:string}>();
  const { state, connect, disconnect, clearError } = useRoleplaySession({
    scenarioId,
    languageId,
    difficultyId,
    serverUrl,
    autoConnect: false,
  });

  useEffect(()=>{
    if(id){
      setScenarioId(id);
      void connect({ serverUrl });
    }
  }, [connect, id, serverUrl])


  const canConnect = useMemo(() => {
    return (
      state.transportState === "disconnected" ||
      state.transportState === "error"
    );
  }, [state.transportState]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>TalkThrough</Text>
            <Text style={styles.title}>Pipecat React Native Debug Screen</Text>
            <Text style={styles.subtitle}>
              Minimal RN client wired to the live Pipecat server, helper
              messages, and transcript callbacks.
            </Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Transport</Text>
            <Text style={styles.statusValue}>{state.transportState}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Setup</Text>

          <Text style={styles.fieldLabel}>Server URL</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setServerUrl}
            placeholder="http://localhost:7860"
            style={styles.input}
            value={serverUrl}
          />

          <Text style={styles.fieldHint}>
            If you are using a real Android device, run `make reverse-android`
            and keep this as `http://localhost:7860`.
          </Text>

          <Text style={styles.fieldLabel}>Scenario</Text>
          <ChoiceChips
            onSelect={setScenarioId}
            options={ROLEPLAY_SCENARIOS}
            selectedId={scenarioId}
          />

          <Text style={styles.fieldLabel}>Language</Text>
          <ChoiceChips
            onSelect={setLanguageId}
            options={ROLEPLAY_LANGUAGES}
            selectedId={languageId}
          />

          <View style={styles.buttonRow}>
            <Pressable
              disabled={!canConnect}
              onPress={() => void connect({ serverUrl })}
              style={[
                styles.button,
                styles.primaryButton,
                !canConnect && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>Connect</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                clearError();
                void disconnect();
              }}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>Disconnect</Text>
            </Pressable>
          </View>
        </View>

        {state.error ? (
          <View style={[styles.card, styles.errorCard]}>
            <Text style={styles.cardTitle}>Error</Text>
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Character Speech</Text>
            <Text style={styles.latestLine}>
              {state.latestBotLine || "Waiting for the bot to speak..."}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Judge</Text>

            <View style={styles.judgeRow}>
              <View style={styles.judgePill}>
                <Text style={styles.judgePillText}>
                  {state.judge.isComplete ? "complete" : "in progress"}
                </Text>
              </View>

              <View style={styles.judgePill}>
                <Text style={styles.judgePillText}>
                  outcome: {state.judge.outcome}
                </Text>
              </View>
            </View>

            <Text style={styles.bodyText}>
              {state.judge.reason || "Judge output will appear here."}
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Translation</Text>
            <Text style={styles.bodyText}>
              {state.translation || "Translation will appear here."}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Suggestions</Text>

            {state.suggestions.length ? (
              state.suggestions.map((suggestion) => (
                <View key={suggestion.romanized} style={styles.suggestionCard}>
                  <Text style={styles.suggestionRomanized}>
                    {suggestion.romanized}
                  </Text>
                  <Text style={styles.suggestionEnglish}>
                    {suggestion.english}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.bodyText}>
                Suggestions will appear here after the first assistant turn.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transcript</Text>

          {state.transcript.length ? (
            state.transcript.map((line) => (
              <View
                key={line.id}
                style={[
                  styles.transcriptLine,
                  line.role === "bot"
                    ? styles.botTranscriptLine
                    : styles.userTranscriptLine,
                ]}
              >
                <Text style={styles.transcriptRole}>
                  {line.role === "bot" ? "Bot" : "You"}
                </Text>
                <Text style={styles.transcriptText}>{line.text}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.bodyText}>
              The conversation transcript will appear here.
            </Text>
          )}
        </View>

        {state.summary ? (
          <View style={[styles.card, styles.summaryCard]}>
            <Text style={styles.cardTitle}>Session Complete</Text>
            <Text style={styles.bodyText}>
              {state.summary.outcome}: {state.summary.reason}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f2ea",
  },
  page: {
    gap: 16,
    padding: 20,
  },
  hero: {
    gap: 16,
  },
  heroCopy: {
    gap: 6,
  },
  eyebrow: {
    color: "#8b5e3c",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: "#1d1d1b",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#5f5a53",
    fontSize: 15,
    lineHeight: 22,
  },
  statusCard: {
    alignSelf: "flex-start",
    backgroundColor: "#fffdfa",
    borderColor: "#ded7cb",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusLabel: {
    color: "#7a756e",
    fontSize: 12,
    textTransform: "uppercase",
  },
  statusValue: {
    color: "#1d1d1b",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fffdfa",
    borderColor: "#ded7cb",
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  cardTitle: {
    color: "#5c5246",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  fieldLabel: {
    color: "#5c5246",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  fieldHint: {
    color: "#7a756e",
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d2c7",
    borderRadius: 14,
    borderWidth: 1,
    color: "#1d1d1b",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: "#f0ebe2",
    borderColor: "#d8d0c4",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: "#26413c",
    borderColor: "#26413c",
  },
  chipText: {
    color: "#4b4338",
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#f8f6f1",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: "#26413c",
  },
  primaryButtonText: {
    color: "#f8f6f1",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#efe7da",
  },
  secondaryButtonText: {
    color: "#3e372e",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  latestLine: {
    color: "#1d1d1b",
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 30,
  },
  bodyText: {
    color: "#2f2a24",
    fontSize: 16,
    lineHeight: 24,
  },
  judgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  judgePill: {
    backgroundColor: "#eef2ff",
    borderColor: "#cfd6f8",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  judgePillText: {
    color: "#31427d",
    fontSize: 14,
    fontWeight: "700",
  },
  suggestionCard: {
    backgroundColor: "#eef6ef",
    borderColor: "#d5e4d7",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  suggestionRomanized: {
    color: "#1d3324",
    fontSize: 16,
    fontWeight: "700",
  },
  suggestionEnglish: {
    color: "#46604b",
    fontSize: 14,
    marginTop: 4,
  },
  transcriptLine: {
    borderRadius: 16,
    gap: 6,
    padding: 14,
  },
  botTranscriptLine: {
    backgroundColor: "#edf3ff",
  },
  userTranscriptLine: {
    backgroundColor: "#f3efe7",
  },
  transcriptRole: {
    color: "#6d6458",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  transcriptText: {
    color: "#1d1d1b",
    fontSize: 16,
    lineHeight: 22,
  },
  errorCard: {
    backgroundColor: "#fff1f0",
    borderColor: "#f2c2bd",
  },
  errorText: {
    color: "#7a1d16",
    fontSize: 15,
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: "#f9f3e5",
    borderColor: "#ead8aa",
  },
});
