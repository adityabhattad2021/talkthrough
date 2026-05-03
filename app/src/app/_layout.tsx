import "react-native-gesture-handler";
import "react-native-get-random-values";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  Geist_400Regular,
  Geist_500Medium,
  useFonts,
} from "@expo-google-fonts/geist";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { colors } from "@/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    SplashScreen.hideAsync().catch(() => {});
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar barStyle="dark-content" backgroundColor={colors.sage50} />
          <Slot />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
