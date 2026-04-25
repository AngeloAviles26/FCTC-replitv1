import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Slot, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AppSplash({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        onDone();
      });
    }, 1800);

    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={[sp.container, { opacity }]}>
      <LinearGradient colors={["#1A5CDB", "#1558B0", "#0f3d80"]} style={sp.gradient}>
        <Animated.View style={[sp.iconWrap, { transform: [{ scale }] }]}>
          <View style={sp.iconCircle}>
            <Feather name="compass" size={44} color="#1A5CDB" />
          </View>
        </Animated.View>
        <Text style={sp.appName}>Campus to Career</Text>
        <Text style={sp.tagline}>Your AI-powered career compass</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function AuthGate() {
  const { user, isLoggedIn } = useApp();
  const segments = useSegments();

  useEffect(() => {
    const inAuth = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    if (!isLoggedIn || !user) {
      if (!inAuth) router.replace("/auth/login");
    } else if (user.onboardingStep !== "complete") {
      if (!inOnboarding) router.replace("/onboarding/step-courses");
    } else {
      if (inAuth || inOnboarding) router.replace("/(tabs)/");
    }
  }, [isLoggedIn, user, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                {showSplash ? (
                  <AppSplash onDone={() => setShowSplash(false)} />
                ) : (
                  <AuthGate />
                )}
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const sp = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  iconWrap: { marginBottom: 8 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 12,
  },
  appName: { fontSize: 28, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
});
