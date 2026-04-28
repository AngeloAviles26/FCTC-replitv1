import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const STEPS = [
  { label: "Fetching SDI snapshots from Philippine job market...", duration: 1200 },
  { label: "Filtering to entry-level postings only...", duration: 1200 },
  { label: "Applying recency weighting (decay_factor=0.9)...", duration: 1200 },
  { label: "Running grade-weighted skill crediting...", duration: 1000 },
  { label: "Comparing profile against market requirements...", duration: 1200 },
  { label: "Generating personalized certification roadmap...", duration: 1000 },
  { label: "Running Skill Decay Warning engine...", duration: 800 },
  { label: "Computing Career Affinity Indicator...", duration: 600 },
];

export default function ComputingScreen() {
  const { completeOnboarding, user } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let stepIdx = 0;
    const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0);

    Animated.timing(progressAnim, {
      toValue: 1, duration: totalDuration + 500, useNativeDriver: false,
    }).start();

    const advance = () => {
      if (stepIdx >= STEPS.length) {
        setDone(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        completeOnboarding().then(() => {
          setTimeout(() => router.replace("/(tabs)/"), 1500);
        });
        return;
      }
      setCurrentStep(stepIdx);
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, stepIdx]);
        stepIdx++;
        advance();
      }, STEPS[stepIdx].duration);
    };

    const delay = setTimeout(advance, 300);
    return () => clearTimeout(delay);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <LinearGradient colors={["#0f172a", "#1a2744", "#1A5CDB"]} style={s.bg}>
        <View style={s.content}>
          <View style={s.logoWrap}>
            <Animated.View style={[s.logoRing, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={s.logoIcon}>🎯</Text>
            </Animated.View>
          </View>

          <Text style={s.title}>
            {done ? "Roadmap Ready!" : "Computing Your Roadmap"}
          </Text>
          <Text style={s.subtitle}>
            {done
              ? `Your personalized roadmap for ${user?.targetCareer ?? "your career"} is ready.`
              : `Analyzing ${user?.targetCareer ?? "your target role"} against Philippine job market data`}
          </Text>

          <View style={s.progressContainer}>
            <View style={s.progressTrack}>
              <Animated.View style={[s.progressFill, { width: progressWidth }]} />
            </View>
            <Text style={s.progressLabel}>
              {done ? "100%" : `${Math.round((completedSteps.length / STEPS.length) * 100)}%`}
            </Text>
          </View>

          <View style={s.stepsContainer}>
            {STEPS.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isCurrent = currentStep === i && !isCompleted;
              return (
                <View key={i} style={s.stepRow}>
                  <View style={[s.stepDot,
                    isCompleted && s.stepDotDone,
                    isCurrent && s.stepDotActive]}>
                    {isCompleted ? (
                      <Text style={s.stepDotCheck}>✓</Text>
                    ) : isCurrent ? (
                      <View style={s.stepDotPulse} />
                    ) : null}
                  </View>
                  <Text style={[s.stepText,
                    isCompleted && s.stepTextDone,
                    isCurrent && s.stepTextActive]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {done && (
            <Animated.View style={[s.doneCard, { opacity: fadeAnim }]}>
              <Text style={s.doneTitle}>✅ Analysis Complete</Text>
              <Text style={s.doneText}>Skill gaps ranked · Roadmap generated · Decay warnings computed</Text>
              <Text style={s.doneRedirect}>Opening your dashboard...</Text>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  bg: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
  logoWrap: { alignItems: "center", marginBottom: 28 },
  logoRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  logoIcon: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 28, lineHeight: 20 },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
  progressTrack: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#60a5fa", borderRadius: 3 },
  progressLabel: { fontSize: 13, fontWeight: "700", color: "#60a5fa", fontFamily: "Inter_700Bold", minWidth: 38, textAlign: "right" },
  stepsContainer: { flex: 1 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  stepDotDone: { backgroundColor: "#10b981", borderColor: "#10b981" },
  stepDotActive: { backgroundColor: "rgba(96,165,250,0.3)", borderColor: "#60a5fa" },
  stepDotCheck: { fontSize: 11, color: "#fff", fontWeight: "700" },
  stepDotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#60a5fa" },
  stepText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "Inter_400Regular", lineHeight: 20 },
  stepTextDone: { color: "rgba(255,255,255,0.75)" },
  stepTextActive: { color: "#fff", fontFamily: "Inter_500Medium" },
  doneCard: { backgroundColor: "rgba(16,185,129,0.15)", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#10b981", marginTop: 16 },
  doneTitle: { fontSize: 16, fontWeight: "700", color: "#10b981", fontFamily: "Inter_700Bold", marginBottom: 6 },
  doneText: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginBottom: 6 },
  doneRedirect: { fontSize: 12, color: "#60a5fa", fontFamily: "Inter_500Medium" },
});
