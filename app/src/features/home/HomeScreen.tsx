import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

import { HomeHeader } from "./components/HomeHeader";
import { HomeProgressIntro } from "./components/HomeProgressIntro";
import { ScenarioGrid } from "./components/ScenarioGrid";
import { ScenarioSheet } from "./components/ScenarioSheet";
import { SettingsSheet } from "./components/SettingsSheet";
import { UpNextCard } from "./components/UpNextCard";
import { useHomeData } from "./hooks/useHomeData";
import { useHomeScreenState } from "./hooks/useHomeScreenState";
import { HomeData } from "./model/types";

export function HomeScreen() {
  const { data, error, isLoading } = useHomeData();

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.sage500} />
          <Text style={styles.stateText}>Loading your practice space.</Text>
        </View>
      );
    }

    if (error || !data) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Home unavailable</Text>
          <Text style={styles.stateText}>
            {error ?? "We couldn't load your scenarios right now."}
          </Text>
        </View>
      );
    }

    return <LoadedHomeContent data={data} />;
  }, [data, error, isLoading]);

  return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
}

function LoadedHomeContent({ data }: { data: HomeData }) {
  const { width } = useWindowDimensions();
  const {
    closeScenario,
    closeSettings,
    difficultyId,
    isScenarioSheetOpen,
    isSettingsSheetOpen,
    openScenario,
    openSettings,
    recommendedScenario,
    selectDifficulty,
    selectedScenario,
  } = useHomeScreenState(data);
  const recommendedScenarioIndex = recommendedScenario
    ? data.scenarios.findIndex((scenario) => scenario.id === recommendedScenario.id)
    : -1;
  const contentWidth = Math.min(width - spacing[4] * 2, 760);

  return (
    <>
      <HomeHeader
        firstName={data.user.firstName}
        onPressSettings={openSettings}
        streakCount={data.streakCount}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentColumn, { width: contentWidth }]}>
          <HomeProgressIntro scenario={data.scenarios[recommendedScenarioIndex]?.title} />

          {recommendedScenario ? (
            <UpNextCard
              onPress={openScenario}
              position={recommendedScenarioIndex >= 0 ? recommendedScenarioIndex : 0}
              scenario={recommendedScenario}
              totalScenarios={data.scenarios.length}
            />
          ) : null}

          <ScenarioGrid
            onPressScenario={openScenario}
            recommendedScenarioId={data.recommendedScenarioId}
            scenarios={data.scenarios}
          />
        </View>
      </ScrollView>

      <ScenarioSheet
        difficultyId={difficultyId}
        difficultyOptions={data.difficultyOptions}
        onBegin={({ difficultyId: selectedDifficultyId, scenarioId }) => {
          closeScenario();
          Alert.alert(
            "Scenario selected",
            `${scenarioId} on ${selectedDifficultyId} is ready to wire into roleplay.`,
          );
        }}
        onClose={closeScenario}
        onSelectDifficulty={selectDifficulty}
        scenario={selectedScenario}
        visible={isScenarioSheetOpen}
      />

      <SettingsSheet onClose={closeSettings} visible={isSettingsSheetOpen} />
    </>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: "center",
    flex: 1,
    gap: spacing[3],
    justifyContent: "center",
    paddingHorizontal: spacing[6],
  },
  contentColumn: {
    gap: spacing[4],
  },
  errorTitle: {
    ...typography.title,
    color: colors.ink,
  },
  safeArea: {
    backgroundColor: colors.sage50,
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    gap: spacing[4],
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[4],
  },
  stateText: {
    ...typography.body,
    color: colors.fog,
    textAlign: "center",
  },
});
